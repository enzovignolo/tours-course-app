const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: 'natoursapp@support.com',
    to: options.to,
    subject: options.subject,
    text: options.message
  };
  transport.sendMail(mailOptions);
};
module.exports = sendMail;
