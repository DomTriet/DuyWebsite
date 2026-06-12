// Thiết lập mock cho @supabase/supabase-js
// Tất cả test files import file này qua jest.config setupFilesAfterFramework

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Đảm bảo các biến môi trường cần thiết có giá trị mock khi test
process.env.SUPABASE_URL            = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY       = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
process.env.CORS_ORIGIN             = '*';
