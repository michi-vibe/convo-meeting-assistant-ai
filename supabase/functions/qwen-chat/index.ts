
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

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

    // 获取用户的OA信息
    const { data: oaUser, error: oaUserError } = await supabase
      .from('oa_user')
      .select('*')
      .eq('email', user.email)
      .single();

    // 获取用户profile信息
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 获取聊天历史（最近10条消息）
    let chatHistory = [];
    if (sessionId) {
      const { data: messages, error: historyError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (!historyError && messages) {
        chatHistory = messages.map(msg => ({
          role: msg.message_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      }
    }

    // 获取可用的会议室信息
    const { data: meetingRooms, error: roomsError } = await supabase
      .from('oa_meetting')
      .select('*')
      .eq('status', 1)
      .order('capacity', { ascending: false });

    // 获取用户的会议信息
    const { data: userMeetings, error: meetingsError } = await supabase
      .from('meeting_arrangements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 获取所有活跃用户信息
    const { data: allUsers, error: usersError } = await supabase
      .from('oa_user')
      .select('id, real_name, department, role, email, username')
      .eq('status', 1)
      .limit(20);

    if (roomsError || usersError) {
      console.error('Database query error:', roomsError || usersError);
    }

    // 构建用户上下文信息
    let userContext = '';
    if (oaUser) {
      userContext += `\n\n当前用户信息：\n`;
      userContext += `- 姓名：${oaUser.real_name || oaUser.username}\n`;
      userContext += `- 部门：${oaUser.department || '未指定'}\n`;
      userContext += `- 职位：${oaUser.role || '未指定'}\n`;
      userContext += `- 邮箱：${oaUser.email}\n`;
    }

    // 构建会议室上下文信息
    let contextInfo = '';
    if (meetingRooms && meetingRooms.length > 0) {
      contextInfo += `\n\n当前可用的会议室信息：\n`;
      meetingRooms.forEach(room => {
        contextInfo += `- ${room.name}：位于${room.location || '未指定位置'}，容纳${room.capacity || '未知'}人`;
        if (room.equipment) {
          contextInfo += `，设备：${room.equipment}`;
        }
        contextInfo += '\n';
      });
    }

    // 构建用户会议历史信息
    if (userMeetings && userMeetings.length > 0) {
      contextInfo += `\n\n用户最近的会议安排：\n`;
      userMeetings.forEach(meeting => {
        contextInfo += `- ${meeting.title}：${new Date(meeting.start_time).toLocaleString()}，状态：${meeting.status}\n`;
      });
    }

    // 构建团队成员信息
    if (allUsers && allUsers.length > 0) {
      contextInfo += `\n当前系统中的人员信息：\n`;
      const departments = [...new Set(allUsers.map(u => u.department).filter(Boolean))];
      contextInfo += `可协调的部门：${departments.join('、')}\n`;
      
      // 按部门分组显示人员
      const usersByDept = allUsers.reduce((acc, user) => {
        const dept = user.department || '其他';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(user);
        return acc;
      }, {});

      Object.entries(usersByDept).forEach(([dept, users]) => {
        contextInfo += `${dept}部门人员：${users.map(u => u.real_name || u.username).join('、')}\n`;
      });
    }

    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY is not configured');
    }

    // 构建完整的对话历史
    const conversationMessages = [
      {
        role: 'system',
        content: `你是一个专业的会议数字分身助手。你可以帮助用户安排会议、准备材料、协调参会者。请用中文回复，语气友好专业。

你能够记住本次对话的所有历史内容，并根据上下文提供连贯的服务。

${userContext}

当用户询问会议相关问题时，请根据以下真实的系统信息提供具体的建议和方案：${contextInfo}

请根据用户的需求，推荐合适的会议室，并提供具体的会议安排建议。如果用户询问具体的会议安排，请提供详细的时间、地点、参会人员建议。

你可以主动询问用户的会议需求细节，比如：
- 会议主题和目的
- 预计参会人数
- 希望的会议时间
- 特殊设备需求
- 需要邀请的具体人员

记住用户在本次对话中提到的所有信息，并在后续回复中参考这些信息。`
      },
      ...chatHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // 调用通义千问API，包含对话历史
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5-72b-instruct',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    // 分析回复内容，生成相应的操作按钮
    let actions: Array<{label: string; action: string; variant?: 'default' | 'outline'}> = [];

    // 检查是否提到了具体的会议室
    const mentionedRooms = meetingRooms?.filter(room => 
      aiResponse.includes(room.name)
    ) || [];

    // 检查是否提到了具体的人员
    const mentionedUsers = allUsers?.filter(user => 
      aiResponse.includes(user.real_name || user.username)
    ) || [];

    if (aiResponse.includes('确认') || aiResponse.includes('安排') || mentionedRooms.length > 0) {
      actions.push({ label: '确认会议安排', action: 'confirm', variant: 'default' });
      actions.push({ label: '查看详细安排', action: 'details', variant: 'outline' });
    }
    
    if (aiResponse.includes('会议室') || aiResponse.includes('预订')) {
      actions.push({ label: '预订会议室', action: 'book', variant: 'default' });
    }
    
    if (aiResponse.includes('材料') || aiResponse.includes('准备')) {
      actions.push({ label: '准备材料', action: 'materials', variant: 'outline' });
    }

    if (aiResponse.includes('通知') || aiResponse.includes('邀请')) {
      actions.push({ label: '发送通知', action: 'notify', variant: 'outline' });
    }

    // 如果提到了具体的会议室，添加会议室信息到返回数据中
    const responseData: any = { 
      response: aiResponse,
      actions: actions
    };

    if (mentionedRooms.length > 0) {
      responseData.suggestedRooms = mentionedRooms;
    }

    if (mentionedUsers.length > 0) {
      responseData.suggestedUsers = mentionedUsers;
    }

    // 添加用户上下文到响应中
    responseData.userContext = {
      userName: oaUser?.real_name || userProfile?.display_name || '用户',
      department: oaUser?.department,
      role: oaUser?.role
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in qwen-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: '抱歉，我现在无法处理您的请求。请稍后重试。'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
