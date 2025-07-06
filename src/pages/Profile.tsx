
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfileCard } from '@/components/UserProfileCard';
import { toast } from 'sonner';
import { User, Edit3, Save, X, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { userProfile, loading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    real_name: '',
    department: '',
    role: '',
    phone: '',
    avatar_url: ''
  });

  const handleEdit = () => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        display_name: userProfile.display_name || '',
        real_name: userProfile.real_name || '',
        department: userProfile.department || '',
        role: userProfile.role || '',
        phone: userProfile.phone || '',
        avatar_url: userProfile.avatar_url || ''
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('个人资料更新成功！');
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新个人资料失败，请重试');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: '',
      display_name: '',
      real_name: '',
      department: '',
      role: '',
      phone: '',
      avatar_url: ''
    });
  };

  const handleGoBack = () => {
    navigate(-1); // 返回上一个页面
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <h1 className="text-3xl font-bold">个人资料</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UserProfileCard />
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <h1 className="text-3xl font-bold">个人资料</h1>
          </div>
          {!isEditing && userProfile && (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              编辑资料
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UserProfileCard />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {isEditing ? '编辑资料' : '详细信息'}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="flex items-center gap-1">
                      <Save className="h-4 w-4" />
                      保存
                    </Button>
                    <Button onClick={handleCancel} size="sm" variant="outline" className="flex items-center gap-1">
                      <X className="h-4 w-4" />
                      取消
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">显示名称</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="real_name">真实姓名</Label>
                    <Input
                      id="real_name"
                      value={formData.real_name}
                      onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">部门</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">职位</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">电话</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>用户名</Label>
                    <p className="text-sm font-medium">{userProfile?.username || '未设置'}</p>
                  </div>
                  <div>
                    <Label>显示名称</Label>
                    <p className="text-sm font-medium">{userProfile?.display_name || '未设置'}</p>
                  </div>
                  <div>
                    <Label>真实姓名</Label>
                    <p className="text-sm font-medium">{userProfile?.real_name || '未设置'}</p>
                  </div>
                  <div>
                    <Label>部门</Label>
                    <p className="text-sm font-medium">{userProfile?.department || '未设置'}</p>
                  </div>
                  <div>
                    <Label>职位</Label>
                    <p className="text-sm font-medium">{userProfile?.role || '未设置'}</p>
                  </div>
                  <div>
                    <Label>电话</Label>
                    <p className="text-sm font-medium">{userProfile?.phone || '未设置'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
