const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buku.livro@gmail.com',
    pass: 'Buku@2024'
  }
});

const enviarEmailNotificacao = (emailDestinatario, nomeLivro) => {
  const mailOptions = {
    from: 'buku.livro@gmail.com',
    to: emailDestinatario,
    subject: 'Interesse no seu livro',
    text: `Alguém demonstrou interesse no seu livro: ${nomeLivro}. Entre em contato para mais detalhes.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erro ao enviar email:', error);
    } else {
      console.log('Email enviado:', info.response);
    }
  });
};

module.exports = { enviarEmailNotificacao };