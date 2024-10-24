const mysql = require('mysql2');

// Crie a conexão
const connection = mysql.createConnection({
  host: 'localhost',       // ou o endereço do seu servidor
  user: 'root',            // seu usuário do MySQL
  password: 'Buku@2024',   // sua senha do MySQL
  database: 'buku_db'      // o nome do seu banco de dados
});

// Conecte-se ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

module.exports = connection;
