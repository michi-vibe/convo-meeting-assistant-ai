import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, User, MessageSquare, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
  lastMessage: string;
}

interface ChatMessage {
  id: string;
  message_type: 'user' | 'ai';
  content: string;
  created_at: string;
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      
      // 获取用户的聊天会话及消息统计
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          created_at,
          updated_at
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // 为每个会话获取消息数量和最后一条消息
      const sessionsWithStats = await Promise.all(
        (sessionsData || []).map(async (session) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('content, created_at')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .eq('session_id', session.id);

          if (messagesError || countError) {
            console.error('Error loading message stats:', messagesError || countError);
          }

          return {
            ...session,
            messageCount: count || 0,
            lastMessage: messagesData?.[0]?.content || '暂无消息'
          };
        })
      );

      setSessions(sessionsWithStats);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast.error('加载聊天历史失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      setMessagesLoading(true);
      
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('id, message_type, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages: ChatMessage[] = (messagesData || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'user' | 'ai'
      }));

      setMessages(typedMessages);
      setSelectedSession(sessionId);
    } catch (error) {
      console.error('Error loading session messages:', error);
      toast.error('加载会话消息失败');
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">请先登录</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">您需要登录后才能查看聊天历史</p>
            <Button onClick={() => navigate('/auth')}>
              前往登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/chat')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回聊天
              </Button>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">会议历史</h1>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              共 {sessions.length} 个会话
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 会话列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>聊天会话</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">加载中...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无聊天记录</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/chat')}
                    >
                      开始新对话
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSession === session.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => loadSessionMessages(session.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 truncate flex-1">
                            {session.title}
                          </h3>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {session.messageCount}条
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {truncateMessage(session.lastMessage, 60)}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(session.updated_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 消息详情 */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>
                    {selectedSession ? '会话详情' : '选择一个会话查看详情'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {!selectedSession ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>请从左侧选择一个会话查看详情</p>
                    </div>
                  </div>
                ) : messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">加载消息中...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto space-y-4 pr-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex space-x-3 max-w-[80%] ${
                          message.message_type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          {/* 头像 */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.message_type === 'user' 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-gradient-to-r from-green-500 to-blue-500'
                          }`}>
                            {message.message_type === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* 消息内容 */}
                          <div className="flex-1">
                            <div className={`rounded-2xl px-4 py-3 ${
                              message.message_type === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                            
                            {/* 时间戳 */}
                            <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${
                              message.message_type === 'user' ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{formatDate(message.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;