import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'flnservicescorporation1@gmail.com',
    pass: 'zfuxgwmfczqnfayn'
  }
});

export const sendEmail = async (emailData) => {
  try {
    const { to, subject, html, attachments } = emailData;

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: 'FLN Services <flnservicescorporation1@gmail.com>',
      to,
      subject,
      html,
      attachments
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}; 