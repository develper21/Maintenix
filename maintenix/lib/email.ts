import nodemailer from "nodemailer"

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendOTPEmail(email: string, otp: string, name: string) {
    try {
        const info = await transporter.sendMail({
            from: `"MAINTENIX" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Password Reset OTP - MAINTENIX",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              padding: 40px;
              color: white;
            }
            .logo {
              font-size: 32px;
              font-weight: 700;
              text-align: center;
              margin-bottom: 30px;
              background: linear-gradient(to right, #60a5fa, #a78bfa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 30px;
              color: #333;
            }
            .otp-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: 700;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              border-radius: 4px;
              margin-top: 20px;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.8);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">MAINTENIX</div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>We received a request to reset your password. Use the OTP below to complete the password reset process:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p><strong>This OTP is valid for 10 minutes.</strong></p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </div>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>MAINTENIX Team</strong></p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} MAINTENIX - AI-Inspired Maintenance & Asset Intelligence
            </div>
          </div>
        </body>
        </html>
      `,
        })

        console.log("OTP Email sent: %s", info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error("Error sending OTP email:", error)
        return { success: false, error }
    }
}

export function generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString()
}
