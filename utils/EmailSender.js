const nodemailer = require('nodemailer');
const pug = require("pug");
const htmlToText = require ("html-to-text");

module.exports = class Email {
  constructor(user , url) {
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Natours App <${proccess.env.EMAIL_FROM}>` 
     }
  
  newTransport(){
    if(proccess.env.NODE_ENV==="production"){
      //sendgrid
      return 1;
    }
    //in development env
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

  }
  async send(template , subject) {
      //Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${tempalte}.pug`,{
          firstName : this.firstName ,
          url : this.url,
          subject
        });
      // Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject, 
        html,
        text : htmlToText.fromString(html)
      };

      //Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
  }


  async sendWelcome(){
    await this.send("welcome","Welcome to the Natours Family!");
  }

}


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
