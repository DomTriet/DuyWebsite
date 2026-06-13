import { resend } from '../config/resend';

/**
 * Gửi email thông qua Resend API
 */
export const sendEmail = async (to: string, subject: string, htmlContent: string): Promise<void> => {
  try {
    const data = await resend.emails.send({
      from: 'Điểm Tâm BĐS <noreply@bdsdiemtam.com>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });
    console.log('[Notification Service] Email sent successfully:', data);
  } catch (error) {
    console.error('[Notification Service] Error sending email:', error);
  }
};