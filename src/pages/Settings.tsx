
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Palette } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 返回按钮 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </Button>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
          <p className="text-gray-600">管理您的账户和偏好设置</p>
        </div>

        <div className="space-y-6">
          {/* 通知设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>通知设置</span>
              </CardTitle>
              <CardDescription>管理您接收通知的方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">邮件通知</div>
                  <div className="text-sm text-gray-500">接收会议提醒和状态更新</div>
                </div>
                <Button variant="outline" size="sm">启用</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">桌面通知</div>
                  <div className="text-sm text-gray-500">在浏览器中显示通知</div>
                </div>
                <Button variant="outline" size="sm">启用</Button>
              </div>
            </CardContent>
          </Card>

          {/* 隐私设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>隐私与安全</span>
              </CardTitle>
              <CardDescription>保护您的账户安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">两步验证</div>
                  <div className="text-sm text-gray-500">为您的账户添加额外的安全保护</div>
                </div>
                <Button variant="outline" size="sm">设置</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">修改密码</div>
                  <div className="text-sm text-gray-500">更新您的登录密码</div>
                </div>
                <Button variant="outline" size="sm">修改</Button>
              </div>
            </CardContent>
          </Card>

          {/* 个性化设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>个性化</span>
              </CardTitle>
              <CardDescription>自定义您的使用体验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">主题设置</div>
                  <div className="text-sm text-gray-500">选择浅色或深色主题</div>
                </div>
                <Button variant="outline" size="sm">浅色</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">语言设置</div>
                  <div className="text-sm text-gray-500">选择界面显示语言</div>
                </div>
                <Button variant="outline" size="sm">中文</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
