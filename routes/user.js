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