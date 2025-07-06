
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MeetingMaterial {
  id: string;
  meeting_id: string;
  name: string;
  type: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  description: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export const useMaterials = (meetingId?: string) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MeetingMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('meeting_materials')
        .select(`
          *,
          meeting_arrangements!inner(
            id,
            title,
            user_id
          )
        `)
        .eq('meeting_arrangements.user_id', user.id);

      if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setMaterials(data || []);
    } catch (err) {
      console.error('获取材料失败:', err);
      setError('加载材料数据失败');
    } finally {
      setLoading(false);
    }
  };

  const updateMaterialStatus = async (materialId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('meeting_materials')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', materialId);

      if (error) throw error;

      setMaterials(prev => 
        prev.map(m => m.id === materialId ? { ...m, status } : m)
      );
    } catch (error) {
      console.error('更新材料状态失败:', error);
    }
  };

  const createMaterial = async (meetingId: string, material: Partial<MeetingMaterial>) => {
    try {
      // 确保必需字段存在
      const materialData = {
        meeting_id: meetingId,
        name: material.name || '新材料',
        type: material.type || '文档',
        status: material.status,
        assigned_to: material.assigned_to,
        due_date: material.due_date,
        description: material.description,
        ai_generated: material.ai_generated
      };

      const { error } = await supabase
        .from('meeting_materials')
        .insert(materialData);

      if (error) throw error;
      
      await fetchMaterials();
    } catch (error) {
      console.error('创建材料失败:', error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [user, meetingId]);

  return {
    materials,
    loading,
    error,
    updateMaterialStatus,
    createMaterial,
    refreshMaterials: fetchMaterials
  };
};
