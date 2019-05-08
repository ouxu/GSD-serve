const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport(config.mail);

const mail = options => new Promise((resolve, reject) => {
  const mailOptions = {
    from: config.mail.auth.user, // 发送者
    to: options.email, // 接受者,可以同时发送多个,以逗号隔开
    subject: options.subject || '', // 标题
    html: options.content || '',
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      reject(err);
    }
    resolve(info);
  });
});

module.exports = mail;
