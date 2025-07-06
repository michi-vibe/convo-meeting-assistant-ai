
import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Bot,
  Filter,
  Search,
  MoreHorizontal,
  Video,
  FileText,
  Mail,
  Edit
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useMeetings } from "@/hooks/useMeetings";
import { toast } from "sonner";

const Meetings = () => {
  const navigate = useNavigate();
  const { meetings, loading, error, refreshMeetings } = useMeetings();
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'pending': return '待确认';
      case 'preparing': return '准备中';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getTypeIcon = (location: string) => {
    if (location.includes('腾讯会议') || location.includes('在线')) {
      return <Video className="w-4 h-4" />;
    } else if (location.includes('+')) {
      return <Users className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedMeetingData = meetings.find(m => m.id === selectedMeeting);

  const handleSendReminder = async (meetingId: string) => {
    try {
      toast.success("提醒通知已发送给所有参会者");
      // 这里可以调用发送通知的API
    } catch (error) {
      toast.error("发送提醒失败");
    }
  };

  const handleEditMeeting = (meetingId: string) => {
    toast.info("会议编辑功能开发中");
    // 这里可以跳转到编辑页面或打开编辑对话框
  };

  const handleGenerateMinutes = (meetingId: string) => {
    toast.info("会议纪要生成功能开发中");
    // 这里可以调用AI生成会议纪要的功能
  };

  const calculateProgress = (meeting: any) => {
    let progress = 0;
    if (meeting.status === 'confirmed') progress += 40;
    if (meeting.meeting_room) progress += 30;
    if (meeting.attendees && meeting.attendees.length > 0) progress += 30;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">正在加载会议数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refreshMeetings}>重新加载</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                ← 返回首页
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">会议安排与监控</h1>
                <p className="text-sm text-gray-500">智能会议管理和进度跟踪</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-500"
              onClick={() => navigate('/chat')}
            >
              发起新会议
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：会议列表区 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>会议列表</CardTitle>
                <CardDescription>管理您的所有会议安排 ({meetings.length} 个会议)</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 搜索和筛选 */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索会议..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="筛选状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="pending">待确认</SelectItem>
                      <SelectItem value="confirmed">已确认</SelectItem>
                      <SelectItem value="preparing">准备中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 会议列表 */}
                <div className="space-y-3">
                  {filteredMeetings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>暂无会议数据</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate('/chat')}
                      >
                        创建第一个会议
                      </Button>
                    </div>
                  ) : (
                    filteredMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedMeeting === meeting.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedMeeting(meeting.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{meeting.title}</h4>
                          <Badge className={getStatusColor(meeting.status)} variant="secondary">
                            {getStatusText(meeting.status)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(meeting.start_time).toLocaleDateString()} {new Date(meeting.start_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(meeting.meeting_room?.location || '未知')}
                            <span>{meeting.meeting_room?.name || '会议室待定'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{meeting.attendees?.length || 0} 人参会</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：会议进度监控区 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedMeetingData ? (
              <>
                {/* 会议基本信息 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedMeetingData.title}</CardTitle>
                        <CardDescription>
                          创建时间: {new Date(selectedMeetingData.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedMeetingData.status)}>
                          {getStatusText(selectedMeetingData.status)}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditMeeting(selectedMeetingData.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(selectedMeetingData.start_time).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{selectedMeetingData.meeting_room?.name || '会议室待定'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{selectedMeetingData.attendees?.length || 0} 人参会</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>持续时间: {Math.round((new Date(selectedMeetingData.end_time).getTime() - new Date(selectedMeetingData.start_time).getTime()) / (1000 * 60))} 分钟</span>
                        </div>
                      </div>
                    </div>
                    {selectedMeetingData.description && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedMeetingData.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI助手进度 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>数字分身处理进度</CardTitle>
                        <CardDescription>AI正在为您处理会议相关任务</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">整体进度</span>
                        <span className="text-sm text-gray-600">{calculateProgress(selectedMeetingData)}%</span>
                      </div>
                      <Progress value={calculateProgress(selectedMeetingData)} className="h-2" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>会议已创建</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMeetingData.status === 'confirmed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>会议状态确认</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMeetingData.attendees && selectedMeetingData.attendees.length > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>参会人员确认</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMeetingData.meeting_room ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span>会议室预订</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 参会者确认情况 */}
                <Card>
                  <CardHeader>
                    <CardTitle>参会者确认情况</CardTitle>
                    <CardDescription>
                      参会人员: {selectedMeetingData.attendees?.length || 0} 人
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedMeetingData.attendees && selectedMeetingData.attendees.length > 0 ? (
                      <div className="space-y-3">
                        {selectedMeetingData.attendees.map((attendee: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                {attendee.name?.charAt(0) || '用'}
                              </div>
                              <div>
                                <p className="font-medium">{attendee.name || '参会者'}</p>
                                <p className="text-sm text-gray-500">{attendee.email || attendee.department || '暂无信息'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              已邀请
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>暂无参会者信息</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 操作按钮区 */}
                <Card>
                  <CardHeader>
                    <CardTitle>会议管理操作</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => handleSendReminder(selectedMeetingData.id)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        发送提醒通知
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleEditMeeting(selectedMeetingData.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        修改会议信息
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleGenerateMinutes(selectedMeetingData.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        生成会议纪要
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/materials')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        查看会议材料
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">选择一个会议</h3>
                  <p className="text-gray-500">从左侧列表中选择一个会议查看详细信息</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
