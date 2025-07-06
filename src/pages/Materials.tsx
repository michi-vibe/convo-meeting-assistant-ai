
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
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface Material {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'processing' | 'pending';
  assignedTo: string;
  dueDate: string;
  description: string;
  aiGenerated: boolean;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  status: string;
}

const Materials = () => {
  const navigate = useNavigate();
  const [selectedMeeting, setSelectedMeeting] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');

  const meetings: Meeting[] = [
    { id: '1', title: '项目启动会议', date: '2024-01-15', status: 'active' },
    { id: '2', title: '季度总结会议', date: '2024-01-16', status: 'preparing' },
    { id: '3', title: '技术评审会', date: '2024-01-17', status: 'draft' }
  ];

  const materials: Material[] = [
    {
      id: '1',
      name: '项目启动计划书',
      type: 'PDF文档',
      status: 'completed',
      assignedTo: '项目经理',
      dueDate: '2024-01-14',
      description: '包含项目目标、里程碑、资源分配等内容',
      aiGenerated: true
    },
    {
      id: '2',
      name: '需求分析报告',
      type: 'Word文档',
      status: 'processing',
      assignedTo: '产品经理',
      dueDate: '2024-01-15',
      description: '详细的功能需求和非功能需求分析',
      aiGenerated: false
    },
    {
      id: '3',
      name: '技术架构方案',
      type: 'PPT演示',
      status: 'pending',
      assignedTo: '技术负责人',
      dueDate: '2024-01-15',
      description: '系统架构设计和技术选型说明',
      aiGenerated: true
    },
    {
      id: '4',
      name: '预算评估表',
      type: 'Excel表格',
      status: 'completed',
      assignedTo: '财务部',
      dueDate: '2024-01-14',
      description: '项目成本预估和资源预算分析',
      aiGenerated: true
    }
  ];

  const agenda = [
    {
      time: '14:00-14:10',
      item: '会议开场与介绍',
      presenter: '会议主持人',
      materials: ['会议议程', '参会人员名单']
    },
    {
      time: '14:10-14:40',
      item: '项目背景与目标介绍',
      presenter: '项目经理',
      materials: ['项目启动计划书', '项目章程']
    },
    {
      time: '14:40-15:20',
      item: '需求分析与技术方案讨论',
      presenter: '产品经理 & 技术负责人',
      materials: ['需求分析报告', '技术架构方案']
    },
    {
      time: '15:20-15:30',
      item: '中场休息',
      presenter: '',
      materials: []
    },
    {
      time: '15:30-15:50',
      item: '预算与资源分配',
      presenter: '财务部',
      materials: ['预算评估表', '资源分配计划']
    },
    {
      time: '15:50-16:00',
      item: '下一步行动计划与总结',
      presenter: '项目经理',
      materials: ['行动计划模板']
    }
  ];

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
    material.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  selectedMeeting === meeting.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedMeeting(meeting.id)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{meeting.title}</CardTitle>
                  <CardDescription className="text-xs">{meeting.date}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：材料与议程展示区 */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="materials">会议材料</TabsTrigger>
                <TabsTrigger value="agenda">会议议程</TabsTrigger>
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
                  {filteredMaterials.map((material) => (
                    <Card key={material.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg">{material.name}</CardTitle>
                              {material.aiGenerated && (
                                <Badge variant="secondary" className="text-xs">
                                  <Bot className="w-3 h-3 mr-1" />
                                  AI生成
                                </Badge>
                              )}
                            </div>
                            <CardDescription>{material.description}</CardDescription>
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
                              <span>{material.assignedTo}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>截止: {material.dueDate}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
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
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>会议议程</CardTitle>
                    <CardDescription>
                      数字分身已为您制定详细的会议议程，您可以进行调整
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {agenda.map((item, index) => (
                        <div key={index} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-16 text-sm font-medium text-blue-600">
                              {item.time}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{item.item}</h4>
                            {item.presenter && (
                              <p className="text-sm text-gray-600 mb-2">
                                主讲人: {item.presenter}
                              </p>
                            )}
                            {item.materials.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {item.materials.map((mat, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {mat}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧：材料准备要求区 */}
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
                    <span>材料分析进度</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    预计还需要 5 分钟完成剩余材料处理
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 参会者准备要求 */}
            <Card>
              <CardHeader>
                <CardTitle>参会者准备要求</CardTitle>
                <CardDescription>
                  数字分身为每位参会者分析的材料准备清单
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      role: '项目经理',
                      tasks: ['更新项目甘特图', '准备风险评估报告', '整理团队资源表']
                    },
                    {
                      role: '产品经理',
                      tasks: ['完善需求PRD文档', '准备原型演示', '市场调研数据']
                    },
                    {
                      role: '技术负责人',
                      tasks: ['技术方案PPT', '架构图更新', '技术风险清单']
                    }
                  ].map((participant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{participant.role}</h4>
                      <ul className="space-y-1">
                        {participant.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
      </div>
    </div>
  );
};

export default Materials;
