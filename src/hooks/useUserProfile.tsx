
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserFullInfo {
  user_id: string;
  auth_email: string;
  username: string;
  real_name: string;
  department: string;
  role: string;
  phone: string;
  display_name: string;
  avatar_url: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserFullInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching user profile for user:', user.id);

      // 首先尝试使用数据库函数获取完整用户信息
      const { data: functionData, error: functionError } = await supabase.rpc('get_user_full_info', {
        user_uuid: user.id
      });

      console.log('Function data:', functionData);
      console.log('Function error:', functionError);

      if (functionData && functionData.length > 0) {
        console.log('Setting user profile from function data');
        setUserProfile(functionData[0]);
      } else {
        // 如果函数没有返回数据，尝试从 profiles 表获取基本信息
        console.log('Function returned no data, fetching from profiles table');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('Profile data:', profileData);
        console.log('Profile error:', profileError);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }

        if (profileData) {
          setUserProfile({
            user_id: profileData.user_id,
            auth_email: profileData.email || user.email || '',
            username: profileData.username || '',
            real_name: '',
            department: '',
            role: '',
            phone: '',
            display_name: profileData.display_name || '',
            avatar_url: profileData.avatar_url || ''
          });
        } else {
          // 如果 profiles 表中也没有数据，创建一个基本的用户资料
          console.log('No profile data found, creating basic profile');
          const basicProfile = {
            user_id: user.id,
            auth_email: user.email || '',
            username: user.email?.split('@')[0] || '',
            real_name: '',
            department: '',
            role: '',
            phone: '',
            display_name: user.email?.split('@')[0] || '',
            avatar_url: ''
          };
          
          // 尝试在 profiles 表中创建记录
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              user_id: user.id,
              username: basicProfile.username,
              display_name: basicProfile.display_name,
              email: user.email
            });

          if (insertError) {
            console.error('Failed to create profile:', insertError);
          }

          setUserProfile(basicProfile);
        }
      }
    } catch (err) {
      console.error('获取用户资料失败:', err);
      setError('加载用户资料失败');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserFullInfo>) => {
    if (!user) return;

    try {
      console.log('Updating profile with:', updates);
      
      // 更新 profiles 表
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: updates.username,
          display_name: updates.display_name,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // 如果有 oa_user 相关信息，也更新 oa_user 表
      if (updates.real_name || updates.department || updates.role || updates.phone) {
        const { error: oaUserError } = await supabase
          .from('oa_user')
          .update({
            real_name: updates.real_name,
            department: updates.department,
            role: updates.role,
            phone: updates.phone,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);

        // 忽略"未找到行"错误，因为用户可能还没有 oa_user 记录
        if (oaUserError && !oaUserError.message.includes('No rows found')) {
          console.error('OA User update error:', oaUserError);
        }
      }

      await fetchUserProfile();
    } catch (error) {
      console.error('更新用户资料失败:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  return {
    userProfile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchUserProfile
  };
};
