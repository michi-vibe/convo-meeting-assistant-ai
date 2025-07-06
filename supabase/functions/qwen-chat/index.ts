import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY is not configured');
    }

    // 调用通义千问API
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
            content: '你是一个专业的会议数字分身助手。你可以帮助用户安排会议、准备材料、协调参会者。请用中文回复，语气友好专业。当用户询问会议相关问题时，要提供具体的建议和方案。'
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
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    // 分析回复内容，生成相应的操作按钮
    let actions: Array<{label: string; action: string; variant?: 'default' | 'outline'}> = [];

    if (aiResponse.includes('确认') || aiResponse.includes('安排')) {
      actions.push({ label: '确认会议安排', action: 'confirm', variant: 'default' });
      actions.push({ label: '修改建议', action: 'modify', variant: 'outline' });
    }
    
    if (aiResponse.includes('会议室') || aiResponse.includes('预订')) {
      actions.push({ label: '预订会议室', action: 'book', variant: 'default' });
    }
    
    if (aiResponse.includes('材料') || aiResponse.includes('准备')) {
      actions.push({ label: '准备材料', action: 'materials', variant: 'outline' });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      actions: actions
    }), {
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