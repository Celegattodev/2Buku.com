const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const saltRounds = 10;

// Configurações do banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'buku_db'
});

// Dados do administrador
const admin = {
  name: 'Admin Name',
  email: 'admin@example.com',
  state: 'SP',
  city: 'São Paulo',
  password: 'admin12345', 
  phone: '1234567890',
  biography: 'Administrador da plataforma Buku.'
};

// Criptografar a senha e inserir o administrador no banco de dados
bcrypt.hash(admin.password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao criptografar a senha:', err);
  } else {
    console.log('Senha criptografada:', hash);
    admin.password = hash;

    const sql = 'INSERT INTO admins (name, email, state, city, password, phone, biography) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [admin.name, admin.email, admin.state, admin.city, admin.password, admin.phone, admin.biography], (err, result) => {
      if (err) {
        console.error('Erro ao inserir administrador no banco de dados:', err);
      } else {
        console.log('Administrador inserido com sucesso:', result);
      }
      connection.end();
    });
  }
});