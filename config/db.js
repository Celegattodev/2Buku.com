const mysql = require('mysql2');

// Configuração do banco de dados
const dbOptions = {
    host: 'localhost',
    user: 'root',
    password: '', // Senha do MySQL (deixe em branco se não houver)
    database: 'buku_db' // Nome do seu banco de dados
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
