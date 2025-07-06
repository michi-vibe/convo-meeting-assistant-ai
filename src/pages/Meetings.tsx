
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
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'offline' | 'online' | 'hybrid';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  participants: {
    total: number;
    confirmed: number;
    pending: number;
  };
  materials: {
    total: number;
    ready: number;
  };
  venue: {
    status: 'booked' | 'pending' | 'not-required';
    name?: string;
  };
  aiProgress: number;
  organizer: string;
}

const Meetings = () => {
  const navigate = useNavigate();
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>('1');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const meetings: Meeting[] = [
    {
      id: '1',
      title: '项目启动会议',
      date: '2024-01-15',
      time: '14:00-16:00',
      location: 'A会议室',
      type: 'offline',
      status: 'confirmed',
      participants: { total: 8, confirmed: 6, pending: 2 },
      materials: { total: 5, ready: 4 },
      venue: { status: 'booked', name: 'A会议室 (3楼)' },
      aiProgress: 85,
      organizer: '张经理'
    },
    {
      id: '2',
      title: '季度总结会议',
      date: '2024-01-16',
      time: '10:00-12:00',
      location: '腾讯会议',
      type: 'online',
      status: 'scheduled',
      participants: { total: 12, confirmed: 8, pending: 4 },
      materials: { total: 8, ready: 5 },
      venue: { status: 'not-required' },
      aiProgress: 60,
      organizer: '李总监'
    },
    {
      id: '3',
      title: '技术评审会',
      date: '2024-01-17',
      time: '16:00-18:00',
      location: 'B会议室 + 在线',
      type: 'hybrid',
      status: 'in-progress',
      participants: { total: 6, confirmed: 6, pending: 0 },
      materials: { total: 3, ready: 3 },
      venue: { status: 'booked', name: 'B会议室 (2楼)' },
      aiProgress: 100,
      organizer: '王架构师'
    },
    {
      id: '4',
      title: '周例会',
      date: '2024-01-18',
      time: '09:30-10:30',
      location: 'C会议室',
      type: 'offline',
      status: 'scheduled',
      participants: { total: 10, confirmed: 7, pending: 3 },
      materials: { total: 2, ready: 1 },
      venue: { status: 'pending' },
      aiProgress: 45,
      organizer: '赵组长'
    },
    {
      id: '5',
      title: '客户需求讨论',
      date: '2024-01-19',
      time: '15:00-17:00',
      location: '待定',
      type: 'offline',
      status: 'scheduled',
      participants: { total: 5, confirmed: 2, pending: 3 },
      materials: { total: 4, ready: 1 },
      venue: { status: 'pending' },
      aiProgress: 25,
      organizer: '陈产品'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'scheduled': return '已安排';
      case 'in-progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Video className="w-4 h-4" />;
      case 'hybrid': return <Users className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedMeetingData = meetings.find(m => m.id === selectedMeeting);

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
                <CardDescription>管理您的所有会议安排</CardDescription>
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
                      <SelectItem value="scheduled">已安排</SelectItem>
                      <SelectItem value="confirmed">已确认</SelectItem>
                      <SelectItem value="in-progress">进行中</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 会议列表 */}
                <div className="space-y-3">
                  {filteredMeetings.map((meeting) => (
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
                          <span>{meeting.date} {meeting.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(meeting.type)}
                          <span>{meeting.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{meeting.participants.confirmed}/{meeting.participants.total} 人确认</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                          组织者: {selectedMeetingData.organizer}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedMeetingData.status)}>
                          {getStatusText(selectedMeetingData.status)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{selectedMeetingData.date} {selectedMeetingData.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          {getTypeIcon(selectedMeetingData.type)}
                          <span>{selectedMeetingData.location}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{selectedMeetingData.participants.total} 人参会</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span>{selectedMeetingData.materials.total} 个材料</span>
                        </div>
                      </div>
                    </div>
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
                        <span className="text-sm text-gray-600">{selectedMeetingData.aiProgress}%</span>
                      </div>
                      <Progress value={selectedMeetingData.aiProgress} className="h-2" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>会议邀请已发送</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>议程已制定</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>材料清单已生成</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMeetingData.venue.status === 'booked' ? (
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
                      {selectedMeetingData.participants.confirmed} / {selectedMeetingData.participants.total} 人已确认参会
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">确认进度</span>
                        <span className="text-sm text-gray-600">
                          {Math.round((selectedMeetingData.participants.confirmed / selectedMeetingData.participants.total) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(selectedMeetingData.participants.confirmed / selectedMeetingData.participants.total) * 100} 
                        className="h-2" 
                      />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-600">
                            {selectedMeetingData.participants.confirmed}
                          </div>
                          <div className="text-xs text-green-700">已确认</div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-semibold text-yellow-600">
                            {selectedMeetingData.participants.pending}
                          </div>
                          <div className="text-xs text-yellow-700">待确认</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-600">
                            {selectedMeetingData.participants.total}
                          </div>
                          <div className="text-xs text-gray-700">总人数</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 材料汇总进度 */}
                <Card>
                  <CardHeader>
                    <CardTitle>材料汇总进度</CardTitle>
                    <CardDescription>
                      {selectedMeetingData.materials.ready} / {selectedMeetingData.materials.total} 个材料已准备完成
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress 
                        value={(selectedMeetingData.materials.ready / selectedMeetingData.materials.total) * 100} 
                        className="h-2" 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => navigate('/materials')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          查看材料详情
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Bot className="w-4 h-4 mr-2" />
                          AI催促未完成材料
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 操作按钮区 */}
                <Card>
                  <CardHeader>
                    <CardTitle>会议管理操作</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMeetingData.venue.status === 'pending' && (
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          预订会议室
                        </Button>
                      )}
                      {selectedMeetingData.venue.status === 'booked' && (
                        <Button variant="outline">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          查看场地详情
                        </Button>
                      )}
                      <Button variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        发送提醒通知
                      </Button>
                      <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        修改会议时间
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        生成会议纪要
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
