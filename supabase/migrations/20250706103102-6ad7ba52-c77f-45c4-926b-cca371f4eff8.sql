
-- 创建一个函数来同步 oa_user 和 profiles 表的数据
CREATE OR REPLACE FUNCTION public.sync_oa_user_with_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 当 oa_user 表有新插入或更新时，同步到 profiles 表
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- 查找匹配的 auth.users 记录（通过 email）
    INSERT INTO public.profiles (id, user_id, username, display_name, email, updated_at)
    SELECT 
      au.id,
      au.id,
      NEW.username,
      COALESCE(NEW.real_name, NEW.username),
      NEW.email,
      now()
    FROM auth.users au
    WHERE au.email = NEW.email
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email,
      updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 创建触发器，当 oa_user 表发生变化时自动同步
DROP TRIGGER IF EXISTS sync_oa_user_trigger ON public.oa_user;
CREATE TRIGGER sync_oa_user_trigger
  AFTER INSERT OR UPDATE ON public.oa_user
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_oa_user_with_profiles();

-- 创建一个函数来根据用户 ID 获取完整的用户信息
CREATE OR REPLACE FUNCTION public.get_user_full_info(user_uuid uuid)
RETURNS TABLE (
  user_id uuid,
  auth_email text,
  username text,
  real_name text,
  department text,
  role text,
  phone text,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email as auth_email,
    COALESCE(ou.username, p.username) as username,
    ou.real_name,
    ou.department,
    ou.role,
    ou.phone,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  LEFT JOIN public.oa_user ou ON ou.email = p.email
  WHERE p.user_id = user_uuid;
END;
$$;

-- 手动同步现有的 oa_user 数据到 profiles 表
INSERT INTO public.profiles (id, user_id, username, display_name, email, updated_at)
SELECT 
  au.id,
  au.id,
  ou.username,
  COALESCE(ou.real_name, ou.username),
  ou.email,
  now()
FROM public.oa_user ou
JOIN auth.users au ON au.email = ou.email
WHERE ou.status = 1
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  updated_at = EXCLUDED.updated_at;
