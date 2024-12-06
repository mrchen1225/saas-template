import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  // 从环境变量获取发件人配置
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.FROM_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
    throw new Error('邮件配置不完整，请检查环境变量');
  }

  // 创建 Nodemailer 传输器
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // 如果端口是465，则使用SSL
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // 定义邮件选项
  const mailOptions = {
    from: fromEmail,
    to: to,
    subject: `[aidisturbance] ${subject}`,
    text: text,
    html: html,
  };

  try {
    // 发送邮件
    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info.messageId);
    return info;
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw error;
  }
}
