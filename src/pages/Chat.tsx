
import { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic, Paperclip, Bot, User, CheckCircle, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'confirmed';
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'outline';
  }>;
  suggestedRooms?: Array<{
    id: number;
    name: string;
    location: string;
    capacity: number;
    equipment: string;
  }>;
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初始化或获取当前会话
  const initializeSession = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 创建新会话
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: '新对话'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setCurrentSessionId(session.id);

      // 添加欢迎消息到数据库
      const welcomeMessage = {
        session_id: session.id,
        user_id: user.id,
        message_type: 'ai',
        content: '您好！我是您的会议数字分身助手。我可以帮您安排会议、准备材料、协调参会者。请告诉我您想要安排什么会议？',
        status: 'sent'
      };

      await supabase.from('chat_messages').insert(welcomeMessage);
      
      // 加载会话消息
      await loadSessionMessages(session.id);
      
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('初始化会话失败');
    } finally {
      setLoading(false);
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 从数据库加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        type: msg.message_type as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        status: (msg.status as 'sending' | 'sent' | 'confirmed') || 'sent',
        actions: msg.actions as Array<{
          label: string;
          action: string;
          variant?: 'default' | 'outline';
        }> || undefined
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('加载历史消息失败');
    }
  };

  // 保存消息到数据库
  const saveMessageToDb = async (message: Message, messageType: 'user' | 'ai') => {
    if (!user || !currentSessionId) return;

    try {
      await supabase.from('chat_messages').insert({
        session_id: currentSessionId,
        user_id: user.id,
        message_type: messageType,
        content: message.content,
        actions: message.actions,
        status: message.status || 'sent'
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  useEffect(() => {
    if (user) {
      initializeSession();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('qwen-chat', {
        body: { message: userMessage }
      });

      if (error) {
        throw error;
      }

      const aiResponse = data.response || '抱歉，我现在无法处理您的请求。';
      const actions = data.actions || [];
      const suggestedRooms = data.suggestedRooms || [];

      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        status: 'sent',
        actions: actions,
        suggestedRooms: suggestedRooms.length > 0 ? suggestedRooms : undefined
      };

      setMessages(prev => [...prev, newMessage]);
      
      // 保存AI回复到数据库
      await saveMessageToDb(newMessage, 'ai');
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('AI响应失败，请重试');
      
      // 显示错误消息
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: '抱歉，我现在无法处理您的请求。请检查网络连接或稍后重试。',
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await saveMessageToDb(errorMessage, 'ai');
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue.trim(),
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, newMessage]);
      
      // 保存用户消息到数据库
      await saveMessageToDb(newMessage, 'user');
      
      getAIResponse(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case 'confirm':
        const confirmMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: '确认会议安排',
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages(prev => [...prev, confirmMessage]);
        await saveMessageToDb(confirmMessage, 'user');
        getAIResponse('确认');
        break;
      case 'details':
        navigate('/meetings');
        break;
      case 'book':
        // 模拟跳转到会议室预订
        alert('正在跳转到OA系统预订会议室...');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                ← 返回首页
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">数字分身助手</h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-500">在线</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/chat-history')}>
              会议历史
            </Button>
          </div>
        </div>
      </header>

      {/* 对话区域 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 消息列表 */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">正在初始化会话...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* 头像 */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-gradient-to-r from-green-500 to-blue-500'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                        {/* 消息内容 */}
                        <div className="flex-1">
                          <div className={`rounded-2xl px-4 py-3 ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                          
                          {/* 建议的会议室信息 */}
                          {message.suggestedRooms && message.suggestedRooms.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm font-medium text-gray-700">推荐会议室：</div>
                              {message.suggestedRooms.map((room) => (
                                <Card key={room.id} className="p-3 bg-blue-50 border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">{room.name}</div>
                                      <div className="text-sm text-gray-600">
                                        📍 {room.location} • 👥 容纳{room.capacity}人
                                      </div>
                                      {room.equipment && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          🔧 {room.equipment}
                                        </div>
                                      )}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAction('book')}
                                      className="ml-2"
                                    >
                                      预订
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                          
                          {/* 操作按钮 */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {message.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.variant || 'default'}
                                  size="sm"
                                  onClick={() => handleAction(action.action)}
                                  className="text-sm"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* 时间戳和状态 */}
                          <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${
                            message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.status === 'confirmed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                            {message.status === 'sending' && <Clock className="w-3 h-3" />}
                          </div>
                        </div>
                    </div>
                  </div>
                ))}

                {/* AI输入状态 */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3 max-w-[80%]">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="请描述您想要安排的会议..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="min-h-[50px] max-h-[120px] resize-none pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled={loading}>
                  <Mic className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isTyping || loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* 快捷建议 */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['项目启动会议', '团队周会', '季度总结会议', '技术评审会'].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(suggestion)}
                  disabled={loading}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
