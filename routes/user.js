const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware de autenticação (se necessário)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/inscricao-buku');
};

// Rota para exibir o perfil do usuário
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const books = await db.query('SELECT * FROM books WHERE user_id = ?', [userId]);

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

module.exports = router;

//update profile

router.get('/profile', async (req, res) => {
    try {
      const userId = req.user.id; 
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar informações do perfil' });
    }
  });

  const multer = require('multer');
const path = require('path');
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

router.post('/profile', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, description } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // Ajuste o caminho conforme sua estrutura de diretórios
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, description, image: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
});