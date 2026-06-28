export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <p>Hello,</p>
      <p>We're writing to confirm that your password has been successfully reset.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
          ✓
        </div>
      </div>
      <p>If you did not initiate this password reset, please contact our support team immediately.</p>
      <p>For security reasons, we recommend that you:</p>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Enable two-factor authentication if available</li>
        <li>Avoid using the same password across multiple sites</li>
      </ul>
      <p>Thank you for helping us keep your account secure.</p>
      <p>Best regards,<br>Your App Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </body>
  </html>
  `;

export const PASSWORD_UPDATED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Updated Successfully</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
  <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e5e7eb;">
    
    <!-- Header / Icon -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background-color: #ecfdf5; color: #10b981; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; display: inline-block; font-size: 28px; font-weight: bold; margin-bottom: 16px;">
        ✓
      </div>
      <h1 style="color: #111827; margin: 0; font-size: 24px; font-weight: 700; tracking-tight: -0.025em;">Password Updated</h1>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Your account security has been refreshed.</p>
    </div>

    <!-- Body Content -->
    <div>
      <p style="margin-top: 0; margin-bottom: 16px; font-size: 16px;">Hello,</p>
      <p style="margin-bottom: 24px; font-size: 16px; color: #4b5563;">We are writing to confirm that the password for your account has been successfully changed.</p>
      
      <!-- Security Alert Box -->
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 28px;">
        <p style="margin: 0; font-weight: 600; color: #b45309; font-size: 14px;">Didn't make this change?</p>
        <p style="margin: 4px 0 0 0; color: #78350f; font-size: 14px;">If you did not update your password, your account may have been compromised. Please contact our support team immediately to secure your data.</p>
      </div>

      <!-- Security Best Practices -->
      <p style="margin-bottom: 12px; font-weight: 600; font-size: 14px; text-transform: uppercase; tracking: 0.05em; color: #6b7280;">Security Reminders:</p>
      <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #4b5563; font-size: 15px;">
        <li style="margin-bottom: 8px;">Never share your password or verification codes with anyone.</li>
        <li style="margin-bottom: 8px;">Enable multi-factor authentication (MFA) if you haven't already.</li>
        <li style="margin-bottom: 0;">Make sure your recovery email and phone number are up to date.</li>
      </ul>

      <p style="margin-bottom: 4px; font-size: 16px;">Best regards,</p>
      <p style="margin: 0; font-weight: 600; color: #4f46e5; font-size: 16px;">Your App Team</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 4px 0;">This is an automated security notification. Please do not reply directly to this email.</p>
    <p style="margin: 0;">&copy; 2026 Your Company Inc. All rights reserved.</p>
  </div>
</body>
</html>
`;
export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Our Platform</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <!-- Header -->
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to Our Community!</h1>
  </div>

  <!-- Body -->
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>

    <p>We're excited to have you join us! 🎉</p>

    <p>Your account has been successfully created, and you're now part of a growing community that's here to support your journey.</p>

    <p>Here’s what you can do next:</p>
    <ul>
      <li>🚀 Explore your dashboard and features</li>
      <li>🛒 Shop products by uploading handwritten list</li>
      <li>📩 Stay connected for updates and tips</li>
    </ul>

    <p>If you have any questions, feel free to reach out. We’re here to help!</p>

    <p>Enjoy your experience with us, and welcome aboard!</p>

    <p>Warm regards,<br/>The YourApp Team</p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated email. Please do not reply directly to this message.</p>
  </div>
</body>
</html>

`;
