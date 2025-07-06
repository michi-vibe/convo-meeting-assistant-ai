
import { MessageSquare } from "lucide-react";

interface AuthHeaderProps {
  isLogin: boolean;
}

export const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">智能会议助手</h1>
      </div>
      <p className="text-gray-600">
        {isLogin ? "欢迎登录数字分身平台" : "创建您的数字分身平台账号"}
      </p>
    </div>
  );
};
