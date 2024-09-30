const nodemailer = require('nodemailer');

// Configura o transportador de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buku.livro@gmail.com',
    pass: 'Buku@2024'
  }
});

// Função para enviar email de notificação
const enviarEmailNotificacao = (to, subject, text) => {
  const mailOptions = {
    from: 'buku.livro@gmail.com',
    to,
    subject,
    text
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { enviarEmailNotificacao };