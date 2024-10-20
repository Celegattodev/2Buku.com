const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buku.livro@gmail.com',
    pass: 'sdmj lybh fcrf nqyd'
  }
});

const enviarEmailComTemplate = (to, subject, templateName, templateData) => {
  ejs.renderFile(path.join(__dirname, '..', 'views', `${templateName}.ejs`), templateData, (err, html) => {
    if (err) {
      console.error('Erro ao renderizar o template EJS:', err);
      return;
    }

    const mailOptions = {
      from: '"Buku 📚"<buku.livro@gmail.com>',
      to: to,
      subject: subject,
      html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar email:', error);
      } else {
        console.log('Email enviado:', info.response);
      }
    });
  });
};

module.exports = { enviarEmailComTemplate };