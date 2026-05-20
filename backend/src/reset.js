const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

// LƯU Ý: Phải dùng SUPABASE_SERVICE_ROLE_KEY (Lấy trong file .env của bạn)
const supabase = createClient(
  'https://srdljesibcppzunjqasg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZGxqZXNpYmNwcHp1bmpxYXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1NDUxNywiZXhwIjoyMDk0MzMwNTE3fQ.K1LlVXBoSWFYnhYbb2nctQIxc_9j-TgJ-v80XUMlB9E',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      WebSocket: WebSocket
    }
  }
);

async function forceResetPassword() {
  const targetEmail = 'domquangminhtriet17@gmail.com'; // Thay bằng email bạn quên mật khẩu
  const newPassword = 'Password@123!';        // Mật khẩu mới bạn muốn đặt
  
  console.log(`Đang tìm kiếm user có email: ${targetEmail}...`);
  const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();
  
  if (findError) return console.error('Lỗi lấy danh sách:', findError.message);
  
  const user = users.find(u => u.email === targetEmail);
  if (!user) return console.log('❌ Không tìm thấy tài khoản với email này!');

  console.log('✅ Đã tìm thấy User ID:', user.id);
  
  // Ép đổi mật khẩu không cần qua email
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id, 
    { password: newPassword }
  );

  if (updateError) {
    console.error('❌ Lỗi cập nhật mật khẩu:', updateError.message);
  } else {
    console.log('🎉 THÀNH CÔNG! Hãy quay lại website và đăng nhập bằng mật khẩu mới.');
  }
}

forceResetPassword();
