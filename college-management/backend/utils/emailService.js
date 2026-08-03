const { Resend } = require('resend');

// Lazy-init: creating this at module load time crashes the ENTIRE server
// on boot if RESEND_API_KEY is missing from .env — even for requests that
// never send an email. Instead we create the client only when actually
// sending, and fail just that one request.
let resendClient = null;
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in .env — email sending is disabled.');
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

exports.sendOTPEmail = async (toEmail, otp, userName = 'User') => {
  try {
    const resend = getResendClient();
    const data = await resend.emails.send({
      from: 'LKCWSC College <noreply@vnssorg.com>',
      to: toEmail,
      subject: `LKCWSC ERP — Login OTP for ${userName}`,
      text: `Dear ${userName},\n\nYour login verification code for LKCWSC ERP is: ${otp}\n\nThis code is valid for 5 minutes. Do not share this code with anyone.\n\nIf you did not request this, please contact the college immediately.\n\nThank you,\nLate Kalpana Chawla Women's Senior College\nGangakhed, Dist. Parbhani`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="background: #8B1A1A; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">LKCWSC College</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Late Kalpana Chawla Women's Senior College, Gangakhed</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Dear ${userName},</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">Your verification code for college portal login:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #ffffff; border: 2px solid #8B1A1A; padding: 20px 40px; border-radius: 8px;">
                <h1 style="color: #8B1A1A; margin: 0; letter-spacing: 6px; font-size: 32px; font-family: monospace;">${otp}</h1>
              </div>
            </div>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">This code is valid for <strong>5 minutes</strong>.</p>
            <p style="color: #555; font-size: 14px; line-height: 1.6;">If you did not request this code, please ignore this email or contact the administrator.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; line-height: 1.6; margin-bottom: 0;">
              Thank you,<br>
              <strong>LKCWSC College</strong><br>
              Gangakhed, Dist. Parbhani
            </p>
          </div>
        </div>
      `
    });

    console.log('Email sent to:', toEmail, '— ID:', data.id);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message || error);
    return { success: false, error: error.message };
  }
};

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send student login credentials
exports.sendCredentialsEmail = async (toEmail, studentName, username, password) => {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: 'LKCWSC College <noreply@vnssorg.com>',
      to: toEmail,
      subject: 'Your LKCWSC College Portal Login Credentials',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#ffffff;">
          <div style="background:#1a237e;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:22px;">Late Kalpana Chawla Women's Senior College</h1>
            <p style="margin:5px 0 0;font-size:13px;">Gangakhed, Dist. Parbhani</p>
          </div>
          <div style="background:#f9f9f9;padding:30px;border-radius:0 0 8px 8px;border:1px solid #ddd;">
            <h2 style="color:#333;margin-top:0;">Dear ${studentName},</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;">Welcome to LKCWSC College! Your login credentials for the student portal are:</p>
            <div style="background:#e8eaf6;border:1px solid #9fa8da;border-radius:8px;padding:20px;margin:20px 0;">
              <p style="margin:8px 0;font-size:15px;"><strong>Portal URL:</strong> <a href="https://college-management-nnve.onrender.com">college-management-nnve.onrender.com</a></p>
              <p style="margin:8px 0;font-size:15px;"><strong>Username:</strong> <code style="background:white;padding:3px 8px;border-radius:4px;">${username}</code></p>
              <p style="margin:8px 0;font-size:15px;"><strong>Password:</strong> <code style="background:white;padding:3px 8px;border-radius:4px;">${password}</code></p>
            </div>
            <p style="color:#C62828;font-size:13px;">⚠️ Please change your password after first login for security.</p>
            <p style="color:#555;font-size:13px;">If you have any issues, contact the Student Section.</p>
            <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
            <p style="color:#999;font-size:12px;">Thank you,<br><strong>Student Section</strong><br>LKCWSC College, Gangakhed</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (e) {
    console.error('Credentials email error:', e.message);
    return { success: false, error: e.message };
  }
};

// Send admin message/notice
exports.sendMessageEmail = async (toEmail, toName, subject, messageBody, fromName) => {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: 'LKCWSC College <noreply@vnssorg.com>',
      to: toEmail,
      subject: `[LKCWSC] ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#1a237e;color:white;padding:16px 20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;font-size:18px;">LKCWSC College — Message</h2>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #ddd;">
            <p style="color:#333;font-size:15px;">Dear ${toName},</p>
            <div style="background:white;border-left:4px solid #1a237e;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="color:#333;font-size:15px;line-height:1.7;white-space:pre-wrap;">${messageBody}</p>
            </div>
            <p style="color:#888;font-size:12px;margin-top:20px;">Sent by: ${fromName} | LKCWSC College, Gangakhed</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (e) {
    console.error('Message email error:', e.message);
    return { success: false, error: e.message };
  }
};
