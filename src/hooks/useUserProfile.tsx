
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

      // 使用新创建的数据库函数获取完整用户信息
      const { data, error } = await supabase.rpc('get_user_full_info', {
        user_uuid: user.id
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setUserProfile(data[0]);
      } else {
        // 如果没有找到完整信息，尝试从 profiles 表获取基本信息
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

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

      if (profileError) throw profileError;

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

        if (oaUserError && !oaUserError.message.includes('No rows found')) {
          throw oaUserError;
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
