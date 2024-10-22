const mysql = require('mysql2');

// Configuração do banco de dados
const dbOptions = {
    host: '35.247.214.162', // O IP ou nome do domínio do seu banco de dados no Google Cloud
    user: 'enzo',      // Seu nome de usuário do banco de dados
    password: 'Buku@2024',  // Sua senha do banco de dados
    database: 'buku_db'        // Nome do seu banco de dados
};

const connection = mysql.createConnection(dbOptions);

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados MySQL.');
});

module.exports = connection;
