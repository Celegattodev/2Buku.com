const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',  // Localhost para o XAMPP
    user: 'root',       // O usuário padrão do MySQL
    password: '',       // Deixe em branco se não definiu uma senha
    database: 'buku_db' // Nome do banco de dados
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL.');
    }
});

module.exports = db;