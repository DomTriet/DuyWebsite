const BRAND_NAME = 'Bất Động Sản Điểm Tâm';
const BRAND_URL = 'https://bdsdiemtam.com';
const BRAND_COLOR = '#B8860B';
const BRAND_DARK = '#0D0D0D';

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:${BRAND_DARK};border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Bất Động Sản</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif;">Điểm Tâm</p>
        </td></tr>

        <!-- Gold accent line -->
        <tr><td style="height:4px;background:linear-gradient(90deg,${BRAND_COLOR},#D4A017,${BRAND_COLOR});"></td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:40px;border-radius:0 0 16px 16px;">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.7;">
            Email này được gửi tự động từ hệ thống ${BRAND_NAME}.<br>
            Vui lòng không trả lời email này.
          </p>
          <p style="margin:12px 0 0;font-size:12px;color:#9CA3AF;">
            <a href="${BRAND_URL}" style="color:${BRAND_COLOR};text-decoration:none;">${BRAND_URL}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function divider(): string {
  return `<tr style="height:1px;"><td style="height:1px;background:#F0EFE9;"></td></tr>`;
}

function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #F5F4F0;">
      <span style="font-size:12px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;">${label}</span><br>
      <span style="font-size:15px;color:#111;font-weight:500;margin-top:2px;display:inline-block;">${value}</span>
    </td>
  </tr>`;
}

export function leadNotificationEmail(opts: {
  agentName?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
  propertyTitle?: string;
}): string {
  const body = `
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:${BRAND_DARK};">Khách hàng mới quan tâm!</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
      ${opts.agentName ? `Xin chào <strong>${opts.agentName}</strong>, bạn` : 'Bạn'} vừa nhận được một yêu cầu tư vấn mới từ hệ thống.
    </p>

    ${opts.propertyTitle ? `
    <div style="background:#FBF9F5;border-left:3px solid ${BRAND_COLOR};border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Bất động sản quan tâm</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:${BRAND_DARK};">${opts.propertyTitle}</p>
    </div>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${infoRow('Tên khách hàng', opts.customerName)}
      ${infoRow('Email', opts.customerEmail || 'Không cung cấp')}
      ${infoRow('Số điện thoại', opts.customerPhone || 'Không cung cấp')}
      ${infoRow('Lời nhắn', opts.message || 'Không có')}
    </table>

    <a href="${BRAND_URL}/admin/leads"
       style="display:inline-block;background:${BRAND_DARK};color:#fff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
      Xem chi tiết trong Dashboard →
    </a>

    <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">
      Hãy liên hệ với khách hàng trong thời gian sớm nhất để không bỏ lỡ cơ hội.
    </p>
  `;
  return baseLayout('Khách hàng mới — Điểm Tâm BĐS', body);
}

export function forumApprovedEmail(opts: {
  authorName?: string;
  postTitle: string;
  postUrl?: string;
}): string {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:56px;height:56px;background:#F0FDF4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">✅</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_DARK};">Bài viết đã được duyệt!</h1>
      <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.6;">
        ${opts.authorName ? `Xin chào <strong>${opts.authorName}</strong>, bài` : 'Bài'} viết của bạn đã vượt qua kiểm duyệt và hiện đang hiển thị trên cộng đồng.
      </p>
    </div>

    <div style="background:#FBF9F5;border:1px solid #E8E6DF;border-radius:10px;padding:20px;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Bài viết</p>
      <p style="margin:0;font-size:17px;font-weight:700;color:${BRAND_DARK};">${opts.postTitle}</p>
    </div>

    ${opts.postUrl ? `
    <div style="text-align:center;">
      <a href="${opts.postUrl}"
         style="display:inline-block;background:${BRAND_DARK};color:#fff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:10px;text-decoration:none;">
        Xem bài viết →
      </a>
    </div>` : ''}

    <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;text-align:center;">
      Cảm ơn bạn đã đóng góp nội dung chất lượng cho cộng đồng Điểm Tâm BĐS.
    </p>
  `;
  return baseLayout('Bài viết đã được duyệt — Điểm Tâm BĐS', body);
}
