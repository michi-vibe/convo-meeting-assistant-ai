import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookMeetingRequest {
  sessionId: string;
  meetingRoomId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, meetingRoomId, title, description, startTime, endTime, attendees }: BookMeetingRequest = await req.json();

    // 获取认证用户
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // 初始化Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 验证用户身份
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // 验证会议室是否存在且可用
    const { data: meetingRoom, error: roomError } = await supabase
      .from('oa_meetting')
      .select('*')
      .eq('id', meetingRoomId)
      .eq('status', 1)
      .single();

    if (roomError || !meetingRoom) {
      throw new Error('会议室不存在或不可用');
    }

    // 检查会议室时间冲突
    const { data: conflictMeetings, error: conflictError } = await supabase
      .from('meeting_arrangements')
      .select('*')
      .eq('meeting_room_id', meetingRoomId)
      .eq('status', 'confirmed')
      .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`);

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
    }

    if (conflictMeetings && conflictMeetings.length > 0) {
      throw new Error('该时间段会议室已被预订');
    }

    // 创建会议安排
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_arrangements')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        meeting_room_id: meetingRoomId,
        attendees: attendees,
        status: 'confirmed'
      })
      .select()
      .single();

    if (meetingError) {
      throw new Error(`创建会议失败: ${meetingError.message}`);
    }

    // 为参会人员发送通知消息
    const notifications = [];
    for (const attendee of attendees) {
      // 查找对应的oa_user记录
      const { data: oaUser, error: oaUserError } = await supabase
        .from('oa_user')
        .select('*')
        .eq('id', attendee.id)
        .single();

      if (!oaUserError && oaUser) {
        notifications.push({
          recipient_id: attendee.id,
          recipient_name: oaUser.real_name || oaUser.username,
          recipient_email: oaUser.email,
          meeting_title: title,
          meeting_room: meetingRoom.name,
          start_time: startTime,
          end_time: endTime
        });
      }
    }

    console.log('Meeting booked successfully:', {
      meetingId: meeting.id,
      title,
      room: meetingRoom.name,
      attendees: notifications.length
    });

    return new Response(JSON.stringify({
      success: true,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        room: meetingRoom.name,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        attendees: notifications
      },
      message: `会议预订成功！已安排在${meetingRoom.name}，并已通知${notifications.length}位参会人员。`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in book-meeting function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      message: '会议预订失败，请重试。'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});