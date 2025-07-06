import { useState } from "react";
import { 
  MessageSquare, 
  Calendar, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  Plus,
  Bell,
  LogOut,
  User,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMeetings } from "@/hooks/useMeetings";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";
import { NotificationDropdown } from "@/components/NotificationDropdown";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { stats, recentMeetings, loading } = useMeetings();
  const [notifications] = useState(3);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("退出登录成功");
      navigate('/auth');
    } catch (error) {
      toast.error("退出登录失败");
    }
  };

  const statsCards = [
    {
      title: "待确认会议",
      value: stats.pending.toString(),
      description: "需要与数字分身确认",
      icon: MessageSquare,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      trend: stats.pending > 0 ? `+${stats.pending}` : "0"
    },
    {
      title: "已确认会议安排",
      value: stats.confirmed.toString(),
      description: "等待参会者响应",
      icon: Calendar,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      trend: stats.confirmed > 0 ? `+${stats.confirmed}` : "0"
    },
    {
      title: "材料准备中",
      value: "0", // 暂时硬编码，后续可以添加材料系统
      description: "数字分身正在处理",
      icon: FileText,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      trend: "0"
    },
    {
      title: "本周会议",
      value: stats.thisWeek.toString(),
      description: "包含已完成会议",
      icon: Users,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      trend: stats.thisWeek > 0 ? `+${stats.thisWeek}` : "0"
    }
  ];

  const quickActions = [
    {
      title: "发起新会议要求",
      description: "与数字分身对话，开始会议筹备",
      icon: Plus,
      color: "bg-gradient-to-r from-blue-600 to-purple-600",
      action: () => navigate("/chat")
    },
    {
      title: "我的会议安排",
      description: "查看和管理所有会议进度",
      icon: Calendar,
      color: "bg-gradient-to-r from-green-600 to-teal-600",
      action: () => navigate("/meetings")
    },
    {
      title: "材料汇总中心",
      description: "查看会议材料准备情况",
      icon: FileText,
      color: "bg-gradient-to-r from-purple-600 to-pink-600",
      action: () => navigate("/materials")
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'pending': return '待确认';
      case 'preparing': return '准备中';
      default: return '未知';
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">数字分身助手</h1>
                  <p className="text-sm text-gray-500">智能会议管理平台</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <UserMenu onSignOut={signOut} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来！</h2>
          <p className="text-gray-600">您的数字分身正在为您处理会议安排</p>
        </div>

        {/* 统计概览区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <div className={`absolute inset-0 ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 快捷功能区 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={action.action}
              >
                <div className={`absolute inset-0 ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* 最近会议 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">最近会议</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/meetings")}
            >
              查看全部
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                          <Badge className={getStatusColor(meeting.status)}>
                            {getStatusText(meeting.status)}
                          </Badge>
                        </div>
                         <div className="flex items-center space-x-4 text-sm text-gray-500">
                           <div className="flex items-center space-x-1">
                             <Clock className="w-4 h-4" />
                             <span>{new Date(meeting.start_time).toLocaleString()}</span>
                           </div>
                           <div className="flex items-center space-x-1">
                             <Users className="w-4 h-4" />
                             <span>{meeting.attendees?.length || 0} 人参会</span>
                           </div>
                           {meeting.meeting_room && (
                             <div className="flex items-center space-x-1">
                               <MapPin className="w-4 h-4" />
                               <span>{meeting.meeting_room.name}</span>
                             </div>
                           )}
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-sm font-medium text-blue-600 mb-1">
                           数字分身状态
                         </div>
                         <div className="text-sm text-gray-500">
                           {meeting.status === 'confirmed' ? '会议已确认' : 
                            meeting.status === 'pending' ? '等待确认中' : '处理中'}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
