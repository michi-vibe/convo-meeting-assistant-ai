
import { useState } from "react";
import { 
  FileText, 
  Download, 
  Edit, 
  Check, 
  Clock, 
  User, 
  Bot,
  Plus,
  Search,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useMeetings } from "@/hooks/useMeetings";
import { useMaterials } from "@/hooks/useMaterials";
import { toast } from "sonner";

const Materials = () => {
  const navigate = useNavigate();
  const { meetings, loading: meetingsLoading } = useMeetings();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { materials, loading: materialsLoading, updateMaterialStatus } = useMaterials(selectedMeetingId);
  
  // 使用第一个会议作为默认选择
  useState(() => {
    if (meetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(meetings[0].id);
    }
  });

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'processing': return '处理中';
      case 'pending': return '待处理';
      default: return '未知';
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (material.assigned_to && material.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusUpdate = async (materialId: string, newStatus: string) => {
    await updateMaterialStatus(materialId, newStatus);
    toast.success('材料状态已更新');
  };

  if (meetingsLoading) {
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
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                ← 返回首页
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">材料汇总中心</h1>
                <p className="text-sm text-gray-500">AI驱动的会议材料准备与管理</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
              <Plus className="w-4 h-4 mr-2" />
              新建材料
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 会议选择器 */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {meetings.map((meeting) => (
              <Card
                key={meeting.id}
                className={`min-w-[250px] cursor-pointer transition-all duration-200 ${
                  selectedMeetingId === meeting.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedMeetingId(meeting.id)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{meeting.title}</CardTitle>
                  <CardDescription className="text-xs flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(meeting.start_time).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {selectedMeeting ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：材料展示区 */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="materials" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="materials">会议材料</TabsTrigger>
                  <TabsTrigger value="agenda">会议信息</TabsTrigger>
                </TabsList>

                <TabsContent value="materials" className="space-y-4">
                  {/* 搜索框 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索材料或负责人..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* 材料列表 */}
                  <div className="space-y-4">
                    {materialsLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p>正在加载材料...</p>
                      </div>
                    ) : filteredMaterials.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>暂无材料数据</p>
                      </div>
                    ) : (
                      filteredMaterials.map((material) => (
                        <Card key={material.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <CardTitle className="text-lg">{material.name}</CardTitle>
                                  {material.ai_generated && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Bot className="w-3 h-3 mr-1" />
                                      AI生成
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription>{material.description || '暂无描述'}</CardDescription>
                              </div>
                              <Badge className={getStatusColor(material.status)}>
                                {getStatusText(material.status)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{material.type}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{material.assigned_to || '未分配'}</span>
                                </div>
                                {material.due_date && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>截止: {new Date(material.due_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(material.id, 
                                    material.status === 'completed' ? 'pending' : 'completed'
                                  )}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="agenda" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>会议信息</CardTitle>
                      <CardDescription>
                        {selectedMeeting.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>开始时间: {new Date(selectedMeeting.start_time).toLocaleString()}</div>
                              <div>结束时间: {new Date(selectedMeeting.end_time).toLocaleString()}</div>
                              <div>状态: {selectedMeeting.status}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">参会信息</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div>参会人数: {selectedMeeting.attendees?.length || 0} 人</div>
                              <div>会议室: {selectedMeeting.meeting_room?.name || '待定'}</div>
                            </div>
                          </div>
                        </div>
                        {selectedMeeting.description && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">会议描述</h4>
                            <p className="text-sm text-gray-600">{selectedMeeting.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* 右侧：材料统计和操作区 */}
            <div className="space-y-6">
              {/* AI助手状态 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">数字分身助手</CardTitle>
                      <CardDescription>正在为您处理材料准备</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>材料完成进度</span>
                      <span className="font-medium">
                        {materials.length > 0 
                          ? Math.round((materials.filter(m => m.status === 'completed').length / materials.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{
                          width: `${materials.length > 0 
                            ? (materials.filter(m => m.status === 'completed').length / materials.length) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      已完成 {materials.filter(m => m.status === 'completed').length} / {materials.length} 项材料
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 材料统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>材料统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">已完成</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {materials.filter(m => m.status === 'completed').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">处理中</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {materials.filter(m => m.status === 'processing').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">待处理</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {materials.filter(m => m.status === 'pending').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 快捷操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快捷操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      导出所有材料清单
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      AI生成会议纪要模板
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      下载会议材料包
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">暂无会议数据</h3>
              <p className="text-gray-500 mb-4">请先创建会议安排</p>
              <Button onClick={() => navigate('/chat')}>
                创建会议
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Materials;
