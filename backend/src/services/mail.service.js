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

  class MailService {
    send = {
      // Send Nin creation email
      async ninCreationMail (to, html) {
        await sendMail(to, "NIN created successfully", html);
      },
      // Send account creation email
      async accountCreationMail(to, html){
        await sendMail(to, "Account created successfully", html);
      }    
    }
  }





module.exports = new MailService;