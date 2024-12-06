import { createClient } from '@supabase/supabase-js';

// 从 Supabase 控制台获取你的 Supabase URL 和 匿名公共 API 密钥
const supabaseUrl = 'https://kwkvzdlonyhjpbxadzls.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a3Z6ZGxvbnloanBieGFkemxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM0NDc0NDQsImV4cCI6MjAzOTAyMzQ0NH0.j0PiSuXEEPosDjfR6lbSUO4q-EuxQyuXpKWlISi-J30';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const bucketName = 'aidisturbance';

export { supabase, bucketName };