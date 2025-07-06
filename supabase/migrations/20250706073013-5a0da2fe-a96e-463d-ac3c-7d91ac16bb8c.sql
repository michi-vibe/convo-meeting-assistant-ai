
-- 更新profiles表，添加username字段（如果不存在的话）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 更新触发器函数以正确处理用户名
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name',
    new.email
  );
  RETURN new;
END;
$$;
