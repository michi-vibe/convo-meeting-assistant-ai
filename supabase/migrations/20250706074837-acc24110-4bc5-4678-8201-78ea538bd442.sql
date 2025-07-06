
-- 修复触发器函数，确保正确处理用户ID和邮箱字段
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, username, display_name, email)
  VALUES (
    new.id,
    new.id,  -- 确保user_id字段被正确设置
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name',
    new.email
  );
  RETURN new;
END;
$$;
