
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Settings, 
  LogOut, 
  UserCircle,
  Mail,
  Calendar
} from "lucide-react";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast.success("退出登录成功");
      navigate('/auth');
    } catch (error) {
      toast.error("退出登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (email: string) => {
    const parts = email.split('@');
    return parts[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user.email || ''} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
              {getUserInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-2" align="end" forceMount>
        {/* 用户信息头部 */}
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" alt={user.email || ''} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-lg">
              {getUserInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {user.user_metadata?.username || user.email?.split('@')[0] || '用户'}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <Mail className="w-3 h-3 mr-1" />
              {user.email}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              注册于 {formatDate(user.created_at)}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 个人资料 */}
        <DropdownMenuItem 
          className="cursor-pointer flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-md"
          onClick={() => navigate('/profile')}
        >
          <UserCircle className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-sm font-medium">个人资料</div>
            <div className="text-xs text-gray-500">查看和编辑个人信息</div>
          </div>
        </DropdownMenuItem>

        {/* 账户设置 */}
        <DropdownMenuItem 
          className="cursor-pointer flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-md"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 text-gray-600" />
          <div>
            <div className="text-sm font-medium">账户设置</div>
            <div className="text-xs text-gray-500">管理账户和偏好设置</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 登出 */}
        <DropdownMenuItem 
          className="cursor-pointer flex items-center space-x-2 p-3 hover:bg-red-50 rounded-md text-red-600"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4" />
          <div>
            <div className="text-sm font-medium">
              {isLoading ? '退出中...' : '退出登录'}
            </div>
            <div className="text-xs opacity-75">安全退出当前账户</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
