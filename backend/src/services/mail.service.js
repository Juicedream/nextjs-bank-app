const mailTransporter = require("../configs/mail.config");

  async function sendMail (to, subject, html) {
    try {
    const info = await mailTransporter.sendMail({
      from: "Next Bank <admin@nextbank.com>",
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    } catch (err) {
      console.error("Error while sending mail:", err);
    }
  }

  const mailService = {
    send : {
      // Send login email
      async loginEmail(to, html) {
        await sendMail(to, "Online Banking Login", html);
      },
      // Send Nin creation email
      async ninCreationMail (to, html) {
        await sendMail(to, "NIN created successfully", html);
      },
      // Send account creation email
      async accountCreationMail(to, html){
        await sendMail(to, "Account created successfully", html);
      },
      // Send forgot password otp email
      async forgotPasswordMail(to, otpCode, html) {
        await sendMail(to, `Your OTP Code: ${otpCode}`, html);
      },
      // Send reset password otp email
      async resetPasswordMail(to, html) {
        await sendMail(to, "Password reset successful", html);
      },

    }
  }





module.exports = mailService;