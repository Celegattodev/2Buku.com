const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Verifique se o db está configurado corretamente
const multer = require('multer');
const path = require('path');

// Middleware de autenticação (se necessário)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/inscricao-buku');
};

// Configuração do multer para upload de imagens
const upload = multer({
  dest: 'uploads/', // Diretório onde os arquivos serão armazenados
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Erro: Apenas imagens JPEG, JPG ou PNG são permitidas');
  }
});

// Rota para exibir o perfil do usuário
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const [books] = await db.query('SELECT * FROM books WHERE user_id = ?', [userId]);

    res.render('userProfile', {
      title: 'Perfil do Usuário',
      navbar: 'navbar', // Assegure-se de que a navbar está sendo renderizada corretamente
      profileImage: user.profile_image || '/img/profile-placeholder.png',
      name: user.name,
      email: user.email,
      state: user.state,
      city: user.city,
      books: books // Envia a lista de livros para o template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rota para atualizar o perfil do usuário
router.post('/profile', isAuthenticated, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, phone, description } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // Ajuste o caminho conforme sua estrutura de diretórios
    }

    // Atualize o perfil do usuário no banco de dados
    const [result] = await db.query(
      'UPDATE users SET name = ?, phone = ?, description = ?, profile_image = ? WHERE id = ?',
      [name, phone, description, imageUrl, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retorne as informações atualizadas
    res.json({
      name,
      phone,
      description,
      profile_image: imageUrl || user.profile_image
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;
