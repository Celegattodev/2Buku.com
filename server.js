const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./config/db'); // Conexão com o banco de dados
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'assets'
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Servir arquivos estáticos da pasta 'pages'
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Rota para a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'inscricao-buku.html'));
});

// Rota para registrar o usuário
app.post('/register', (req, res) => {
    const { fullname, email, password, state } = req.body;

    // Verificar se todos os campos necessários estão presentes
    if (!fullname || !email || !password || !state) {
        return res.status(400).send('Todos os campos são necessários');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO users (fullname, email, password, state) VALUES (?, ?, ?, ?)';
    db.query(sql, [fullname, email, hashedPassword, state], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao registrar usuário');
        }
        res.send('Usuário registrado com sucesso!');
    });
});

// Rota para login do usuário
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar se os campos email e senha estão presentes
    if (!email || !password) {
        return res.status(400).send('Email e senha são necessários');
    }

    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao fazer login');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (passwordMatch) {
            res.send({ success: true, message: 'Login bem-sucedido', redirect: '/pages/user-profile.html' });
        } else {
            res.status(401).send('Senha incorreta');
        }
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
