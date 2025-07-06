
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthHandlers } from "@/hooks/useAuthHandlers";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleLogin, handleRegister } = useAuthHandlers();

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLogin = async (values: { email: string; password: string; rememberMe: boolean }) => {
    setIsLoading(true);
    const result = await handleLogin(values);
    if (result.success) {
      navigate('/');
    }
    setIsLoading(false);
  };

  const onRegister = async (values: { username: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    const result = await handleRegister(values);
    if (result.success) {
      setIsLogin(true);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    toast.info("密码找回功能即将上线");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AuthHeader isLogin={isLogin} />

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "用户登录" : "用户注册"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? "使用邮箱和密码登录您的账户" 
                : "填写以下信息创建新账户"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLogin ? (
              <LoginForm onSubmit={onLogin} isLoading={isLoading} />
            ) : (
              <RegisterForm onSubmit={onRegister} isLoading={isLoading} />
            )}

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="font-normal"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "还没有账号？立即注册" : "已有账号？立即登录"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
