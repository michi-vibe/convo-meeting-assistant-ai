
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthHandlers = () => {
  const handleLogin = async (values: { email: string; password: string; rememberMe: boolean }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error("邮箱或密码错误，请重新输入");
        } else {
          toast.error(error.message);
        }
        return { success: false };
      }

      if (data.user) {
        toast.success("登录成功！");
        return { success: true };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error("登录失败，请稍后重试");
      return { success: false };
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string; confirmPassword: string }) => {
    try {
      console.log('开始注册用户:', values.username, values.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: values.username,
            display_name: values.username,
            email: values.email
          }
        }
      });

      if (error) {
        console.error('注册错误:', error);
        if (error.message.includes('User already registered')) {
          toast.error("该邮箱已被注册，请使用其他邮箱或前往登录");
        } else {
          toast.error(`注册失败: ${error.message}`);
        }
        return { success: false };
      }

      if (data.user) {
        console.log('用户注册成功:', data.user);
        toast.success("注册成功！用户信息已保存到数据库");
        return { success: true };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error("注册失败，请稍后重试");
      return { success: false };
    }
  };

  return { handleLogin, handleRegister };
};
