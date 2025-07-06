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
    const { message } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // 初始化Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取可用的会议室信息
    const { data: meetingRooms, error: roomsError } = await supabase
      .from('oa_meetting')
      .select('*')
      .eq('status', 1)
      .order('capacity', { ascending: false });

    // 获取用户信息
    const { data: users, error: usersError } = await supabase
      .from('oa_user')
      .select('id, real_name, department, role, email')
      .eq('status', 1)
      .limit(10);

    if (roomsError || usersError) {
      console.error('Database query error:', roomsError || usersError);
    }

    // 构建上下文信息
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

    if (users && users.length > 0) {
      contextInfo += `\n当前系统中的部分人员信息：\n`;
      const departments = [...new Set(users.map(u => u.department).filter(Boolean))];
      contextInfo += `可协调的部门：${departments.join('、')}\n`;
    }

    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY is not configured');
    }

    // 调用通义千问API，包含真实的系统信息
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5-72b-instruct',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的会议数字分身助手。你可以帮助用户安排会议、准备材料、协调参会者。请用中文回复，语气友好专业。

当用户询问会议相关问题时，请根据以下真实的系统信息提供具体的建议和方案：${contextInfo}

请根据用户的需求，推荐合适的会议室，并提供具体的会议安排建议。如果用户询问具体的会议安排，请提供详细的时间、地点、参会人员建议。`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

    // 如果提到了具体的会议室，添加会议室信息到返回数据中
    const responseData: any = { 
      response: aiResponse,
      actions: actions
    };

    if (mentionedRooms.length > 0) {
      responseData.suggestedRooms = mentionedRooms;
    }

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