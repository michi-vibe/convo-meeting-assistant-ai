
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  meetingId: string;
  attendeeEmails: string[];
  meetingTitle: string;
  meetingTime: string;
  organizerName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { meetingId, attendeeEmails, meetingTitle, meetingTime, organizerName }: NotificationRequest = await req.json();

    console.log('Sending meeting notifications:', { meetingId, attendeeEmails, meetingTitle });

    // 查找参会人员的用户ID
    const { data: attendees, error: attendeeError } = await supabaseClient
      .from('oa_user')
      .select('id, email, real_name, username')
      .in('email', attendeeEmails);

    if (attendeeError) {
      throw new Error(`查找参会人员失败: ${attendeeError.message}`);
    }

    console.log('Found attendees:', attendees);

    // 为每个找到的参会人员创建通知
    const notifications = [];
    for (const attendee of attendees || []) {
      // 查找对应的profiles记录以获取user_id
      const { data: profiles, error: profileError } = await supabaseClient
        .from('profiles')
        .select('user_id')
        .eq('email', attendee.email)
        .single();

      if (profileError || !profiles) {
        console.warn(`未找到用户 ${attendee.email} 的profile记录`);
        continue;
      }

      notifications.push({
        user_id: profiles.user_id,
        title: `会议邀请：${meetingTitle}`,
        message: `${organizerName} 邀请您参加会议"${meetingTitle}"，时间：${new Date(meetingTime).toLocaleString()}。请及时确认参会。`,
        type: 'info'
      });
    }

    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        throw new Error(`创建通知失败: ${notificationError.message}`);
      }

      console.log(`成功发送 ${notifications.length} 条通知`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `成功发送 ${notifications.length} 条通知`,
        notificationsSent: notifications.length 
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error("发送会议通知错误:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
