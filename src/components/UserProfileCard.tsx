
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User, Mail, Phone, Building, Briefcase } from 'lucide-react';

export const UserProfileCard = () => {
  const { userProfile, loading } = useUserProfile();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">正在加载用户信息...</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = userProfile.real_name || userProfile.display_name || userProfile.username || '用户';
  const userName = userProfile.username || userProfile.auth_email?.split('@')[0] || '未设置';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userProfile.avatar_url} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {displayName}
            </CardTitle>
            <p className="text-sm text-gray-600">@{userName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{userProfile.auth_email}</span>
        </div>
        
        {userProfile.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{userProfile.phone}</span>
          </div>
        )}
        
        {userProfile.department && (
          <div className="flex items-center space-x-2 text-sm">
            <Building className="h-4 w-4 text-gray-500" />
            <span>{userProfile.department}</span>
          </div>
        )}
        
        {userProfile.role && (
          <div className="flex items-center space-x-2 text-sm">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <Badge variant="secondary">{userProfile.role}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
