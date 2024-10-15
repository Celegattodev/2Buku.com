"use strict";

const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const fs = require('fs');
const axios = require("axios");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const saltRounds = 10; // Número de rounds para bcrypt
const ejs = require('ejs');
const { enviarEmailComTemplate } = require("./email/emailService");


// Gera uma chave secreta aleatória para a sessão
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Configura o engine de visualização para EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configura o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, "assets")));

// Configura o middleware para parsing de corpo das requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do middleware de sessão
app.use(
  session({
    secret: generateSecret(), // Substitua por uma chave secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Defina como `true` se usar HTTPS
  })
);

// Configuração do banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Senha do MySQL
  database: "buku_db", // Nome do banco de dados
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar com o banco de dados:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados MySQL.");
});

// Função para obter o nome da cidade usando a API do IBGE
const getCityNameById = async (stateCode, cityId) => {
  try {
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`
    );
    const cities = response.data;
    const city = cities.find((city) => city.id === parseInt(cityId));
    return city ? city.nome : "Cidade desconhecida";
  } catch (error) {
    console.error("Erro ao buscar o nome da cidade:", error);
    return "Cidade desconhecida";
  }
};

app.get('/api/profile', (req, res) => {
  const userId = req.session.userId; // Certifique-se de que o ID do usuário está na sessão
  if (!userId) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  // Consulta SQL para buscar os dados do usuário
  const sql = 'SELECT name, phone, biography FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      return res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Retornar os dados do usuário
    const user = results[0];
    res.json(user);
  });
});

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login'); // Redireciona para login se não estiver autenticado
  }
};

// Rota para a página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "inscricao-buku.html"));
});

// Rota para redirecionar para a página de adicionar livro
app.get("/addBook", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addBook.html"));
});

// Rota para exibir o perfil do usuário
app.get('/profile', isAuthenticated, (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/'); // Redireciona para a página inicial se o usuário não estiver logado
  }

  db.query(
    'SELECT name, email, state, city, phone, biography FROM users WHERE id = ?',
    [req.session.userId],
    async (err, results) => {
      if (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        return res.status(500).send('Erro ao buscar dados do usuário.');
      }

      if (results.length === 0) {
        return res.status(404).send('Usuário não encontrado.');
      }

      const user = results[0];

      // Obter o nome da cidade usando o código da cidade e do estado
      const cityName = await getCityNameById(user.state, user.city);

      // Consulta para buscar os livros do usuário, incluindo a imagem
      db.query('SELECT id, titulo, autor, imagem FROM livros WHERE user_id = ?', [req.session.userId], (err, books) => {
        if (err) {
          console.error('Erro ao buscar livros do usuário:', err);
          return res.status(500).send('Erro ao buscar livros.');
        }

        // Consulta para buscar os livros favoritos do usuário
        db.query('SELECT id, titulo, autor, imagem FROM favoritos WHERE user_id = ?', [req.session.userId], (err, favorites) => {
          if (err) {
            console.error('Erro ao buscar livros favoritos do usuário:', err);
            return res.status(500).send('Erro ao buscar livros favoritos.');
          }

          // Substituição de placeholders no HTML
          const filePath = path.join(__dirname, 'views', 'UserProfile.html');
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Erro interno do servidor');
            }

            // Dados do perfil
            const profileData = {
              name: user.name || 'Nome não disponível',
              email: user.email || 'Email não disponível',
              state: user.state || 'Estado não disponível',
              city: cityName || 'Cidade não disponível',
              phone: user.phone || 'Telefone não disponível',
              description: user.biography || 'Descrição não disponível',
              books: books, // Livros do usuário
            };

            // Renderizar livros com ícone de deletar fixo
            const bookListHTML = profileData.books.map(book => {
              return `
                <div class="swiper-slide book-item" data-book-id="${book.id}" style="position: relative;">
                  <i class="fas fa-trash-alt delete-icon" title="Deletar" style="position: absolute; top: 10px; right: 10px;"></i>
                  <img src="${book.imagem || '/img/default-book-image.jpg'}" alt="${book.titulo}" style="width:120px; height:180px;">
                  <p><strong>${book.titulo}</strong></p>
                  <p>${book.autor}</p>
                </div>`;
            }).join('');

            // Substituir placeholders no HTML
            let html = data
              .replace('{{userName}}', profileData.name)
              .replace('{{userEmail}}', profileData.email)
              .replace('{{userState}}', profileData.state)
              .replace('{{userCity}}', profileData.city)
              .replace('{{userPhone}}', profileData.phone)
              .replace('{{userDescription}}', profileData.description)
              .replace('{{userBooks}}', bookListHTML)

            res.send(html);
          });
        });
      });
    }
  );
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'inscricao-buku.html'));
});

// Rota para processar o login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Verifique se os campos de email e senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email e senha são obrigatórios."
    });
  }

  // Consulta ao banco de dados para verificar se o email existe
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Erro ao verificar email:", err);
      return res.status(500).json({
        success: false,
        message: "Erro no servidor."
      });
    }

    // Se o email não for encontrado
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email não encontrado."
      });
    }

    const user = results[0];

    // Comparação de senha usando bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Erro na comparação da senha:", err);
        return res.status(500).json({
          success: false,
          message: "Erro no servidor."
        });
      }

      // Se a senha for válida, armazene o ID do usuário na sessão
      if (isMatch) {
        req.session.userId = user.id; // Certifique-se de que o ID está correto

        // Sucesso no login, redirecionando para a página de perfil
        return res.status(200).json({
          success: true,
          message: "Login realizado com sucesso!",
          redirect: "/profile" // Redireciona para a página de perfil após o login
        });
      } else {
        // Senha incorreta
        return res.status(401).json({
          success: false,
          message: "Senha incorreta."
        });
      }
    });
  });
});


// Rota para processar o registro
app.post("/register", (req, res) => {
  const { name, email, password, state, city } = req.body;

  if (!name || !email || !password || !state || !city) {
    return res.status(400).json({
      success: false,
      message: "Todos os campos são obrigatórios."
    });
  }

  // Verifica se o email já existe
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Erro ao verificar email:", err);
      return res.status(500).json({
        success: false,
        message: "Erro no servidor."
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email já está registrado."
      });
    }

    // Se o email não existe, prossegue com o registro
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Erro ao criptografar a senha:", err);
        return res.status(500).json({
          success: false,
          message: "Erro no servidor."
        });
      }

      db.query(
        "INSERT INTO users (name, email, password, state, city) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, state, city],
        (err, results) => {
          if (err) {
            console.error("Erro ao registrar o usuário:", err);
            return res.status(500).json({
              success: false,
              message: "Erro no servidor."
            });
          }
          // Envia o email de confirmação
          enviarEmailComTemplate(email, 'Conta criada na Buku', 'templateContaCriada', { name });

          res.status(201).json({
            success: true,
            message: "Usuário registrado com sucesso!"
          });
          
        }
      );
    });
  });
});


// Rota para atualizar o perfil
app.get('/update-profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/'); // Redireciona se o usuário não estiver logado
  }

  db.query('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      return res.status(500).send('Erro ao buscar dados do usuário.');
    }

    if (results.length === 0) {
      return res.status(404).send('Usuário não encontrado.');
    }

    const user = results[0];

    // Carregar o arquivo HTML diretamente
    res.sendFile(path.join(__dirname, 'views', 'updateProfile.html'));
  });
});



// Rota para processar a atualização do perfil
app.post('/update-profile', (req, res) => {
  const { name, phone, biography } = req.body;
  const userId = req.session.userId; // Obtemos o ID do usuário da sessão

  // Verifica se o userId e o nome foram passados corretamente
  if (!userId || !name) {
    console.log('Dados recebidos:', req.body); // Adiciona log para debug
    return res.status(400).json({
      success: false,
      message: 'Nome e ID do usuário são obrigatórios.'
    });
  }

  const updateValues = [name, phone, biography, userId];

  db.query(
    `UPDATE users
     SET name = ?, phone = ?, biography = ?
     WHERE id = ?`,
    updateValues,
    (err) => {
      if (err) {
        console.error('Erro ao atualizar perfil:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar perfil.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!'
      });
    }
  );
});

// Rota para deletar a conta do usuário
app.delete('/delete-account', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const userId = req.session.userId;

  // Obter o email e nome do usuário antes de deletar
  db.query('SELECT email, name FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const { email, name } = results[0];

    // Excluir os livros favoritos do usuário
    db.query('DELETE FROM favoritos WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Erro ao excluir livros favoritos do usuário:', err);
        return res.status(500).json({ success: false, message: 'Erro ao excluir livros favoritos do usuário.' });
      }

      // Excluir os livros do usuário
      db.query('DELETE FROM livros WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
          console.error('Erro ao excluir livros do usuário:', err);
          return res.status(500).json({ success: false, message: 'Erro ao excluir livros do usuário.' });
        }

        // Excluir o usuário
        db.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
          if (err) {
            console.error('Erro ao excluir conta do usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro ao excluir conta do usuário.' });
          }

          // Enviar email de confirmação
          enviarEmailComTemplate(email, 'Sua conta foi deletada', 'templateContaDeletada', { nome: name });

          // Destruir a sessão do usuário
          req.session.destroy((err) => {
            if (err) {
              console.error('Erro ao destruir sessão:', err);
              return res.status(500).json({ success: false, message: 'Erro ao destruir sessão.' });
            }

            res.status(200).json({ success: true, message: 'Conta deletada com sucesso.' });
          });
        });
      });
    });
  });
});
// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar a sessão:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro no servidor.'
      });
    }

    // Redireciona para a página de login com um parâmetro de consulta
    res.redirect('/login?logout=success');
  });
});

// Rota para a página de política de privacidade
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'privacy-policy.html'));
});

// Exemplo de redirecionamento para a página de política de privacidade
app.get('/some-route', (req, res) => {
  res.redirect('/privacy-policy');
});

// API Google Books
app.post('/add-book', isAuthenticated, (req, res) => {
  const { googleBooksId, title, author, imageUrl } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    console.error('Erro: Usuário não autenticado');
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }

  if (!googleBooksId || !title || !author || !imageUrl) {
    console.error('Erro: ID do Google Books, título, autor e imagem são obrigatórios');
    return res.status(400).json({ success: false, message: 'ID do Google Books, título, autor e imagem são obrigatórios' });
  }

  // Verificar se o livro já existe na biblioteca do usuário
  const checkSql = 'SELECT * FROM livros WHERE google_books_id = ? AND user_id = ?';
  db.query(checkSql, [googleBooksId, userId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar a duplicidade do livro:', err);
      return res.status(500).json({ success: false, message: 'Erro ao verificar a duplicidade do livro' });
    }

    if (results.length > 0) {
      // Se o livro já existe, retorna uma mensagem de erro
      console.error('Erro: Livro já existe na biblioteca');
      return res.status(409).json({ success: false, message: 'Livro já existe na biblioteca' });
    }

    // Caso contrário, insere o livro
    const sql = 'INSERT INTO livros (google_books_id, titulo, autor, imagem, user_id, data_adicao) VALUES (?, ?, ?, ?, ?, NOW())';
    db.query(sql, [googleBooksId, title, author, imageUrl, userId], (err, result) => {
      if (err) {
        console.error('Erro ao adicionar o livro:', err);
        return res.status(500).json({ success: false, message: 'Erro ao adicionar o livro' });
      }
      console.log('Livro adicionado com sucesso:', result);
      res.status(201).json({ success: true, message: 'Livro adicionado com sucesso' });
    });
  });
});

app.delete('/delete-book/:id', (req, res) => {
  const bookId = req.params.id;
  const userId = req.session.userId; // O ID do usuário logado

  // Verificar se o livro pertence ao usuário logado
  db.query('DELETE FROM livros WHERE id = ? AND user_id = ?', [bookId, userId], (err, result) => {
    if (err) {
      console.error('Erro ao deletar o livro:', err);
      return res.status(500).json({ success: false, message: 'Erro ao deletar o livro.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado ou não pertence ao usuário.' });
    }

    res.status(200).json({ success: true, message: 'Livro deletado com sucesso.' });
  });
});

// Rota para a página de esqueci a senha
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'esqueci-senha.html'));
});

app.get('/alterar-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'alterar-senha.html'));
});

// Configuração da porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta http://localhost:${PORT}`);
});

// Nodemailler 
// Configuração do Nodemailer
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buku.livro@gmail.com',
    pass: 'sdmj lybh fcrf nqyd'
  }
});

// Endpoint para lidar com a solicitação de redefinição de senha
app.post('/esqueci-senha', (req, res) => {
  const { email } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar email:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Email não encontrado.' });
    }

    // Gerar token de redefinição de senha
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos a partir de agora

    console.log('Token gerado:', resetToken); // Log do token gerado
    console.log('Expiração do token:', tokenExpiry); // Log da expiração do token

    // Atualizar o usuário com o token e o tempo de expiração
    const updateSql = 'UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?';
    db.query(updateSql, [resetToken, tokenExpiry, email], (err) => {
      if (err) {
        console.error('Erro ao atualizar o token no banco de dados:', err);
        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
      }

      // Renderizar o template EJS com o token
      ejs.renderFile(path.join(__dirname, 'views', 'templateAlterarSenha.ejs'), { resetToken }, (err, html) => {
        if (err) {
          console.error('Erro ao renderizar o template:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        // Configuração do e-mail
        let mailOptions = {
          from: '"Buku 📚" <buku.livro@gmail.com>',
          to: email,
          subject: 'Redefinição de Senha',
          html: html
        };

        // Envia o e-mail usando o objeto de transporte definido
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Erro ao enviar o e-mail:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
          }
          res.status(200).json({ success: true, message: 'E-mail de redefinição de senha enviado com sucesso.' });
        });
      });
    });
  });
});

// Endpoint para alterar a senha do usuário
app.post('/alterar-senha', (req, res) => {
  const { token, newPassword } = req.body;

  console.log('Token recebido:', token); // Log do token recebido
  console.log('Nova senha recebida:', newPassword); // Log da nova senha recebida

  const sql = 'SELECT * FROM users WHERE reset_token = ?';
  db.query(sql, [token], (err, results) => {
    if (err) {
      console.error('Erro ao buscar token no banco de dados:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    console.log('Resultados da consulta:', results); // Log dos resultados da consulta

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Token inválido.' });
    }

    const user = results[0];

    // Verificar se o token expirou
    const currentTime = new Date();
    const tokenExpiryTime = new Date(user.token_expiry);
    console.log('Hora atual:', currentTime); // Log da hora atual
    console.log('Expiração do token:', tokenExpiryTime); // Log da expiração do token

    if (currentTime > tokenExpiryTime) {
      return res.status(400).json({ success: false, message: 'Link expirado.' });
    }

    // Criptografar a nova senha antes de armazená-la no banco de dados
    bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('Erro ao criptografar a senha:', err);
        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
      }

      const updateSql = 'UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE reset_token = ?';
      db.query(updateSql, [hashedPassword, token], (err) => {
        if (err) {
          console.error('Erro ao atualizar a senha no banco de dados:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        res.status(200).json({ success: true, message: 'Senha alterada com sucesso' });
      });
    });
    const { email, name } = user;
    enviarEmailComTemplate(email,'Senha alterada com sucesso', 'templateSenhaAlterada', { name });
  });
});

app.set('view engine', 'ejs');
// Envia o email de confirmação
app.set('views', path.join(__dirname, 'views'));

// Rota para exibir os livros favoritos do usuário
app.get('/favorites', isAuthenticated, (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redireciona para a página de login se o usuário não estiver logado
  }

  // Consulta para buscar os livros favoritos do usuário
  db.query('SELECT id, titulo, autor, imagem FROM favoritos WHERE user_id = ?', [req.session.userId], (err, favorites) => {
    if (err) {
      console.error('Erro ao buscar livros favoritos do usuário:', err);
      return res.status(500).send('Erro ao buscar livros favoritos.');
    }

    // Substituição de placeholders no HTML
    const filePath = path.join(__dirname, 'views', 'favorites.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro interno do servidor');
      }

      // Renderizar livros favoritos com ícone de deletar fixo
      const favoriteListHTML = favorites.map(book => {
        return `
          <div class="col-md-4 favorite-item" data-book-id="${book.id}">
            <i class="fas fa-trash-alt delete-favorite-icon" title="Deletar"></i>
            <img src="${book.imagem || '/img/default-book-image.jpg'}" alt="${book.titulo}">
            <p><strong>${book.titulo}</strong></p>
            <p>${book.autor}</p>
          </div>`;
      }).join('');

      // Substituir placeholders no HTML
      let html = data.replace('<!-- Os livros favoritos serão carregados aqui pelo JavaScript -->', favoriteListHTML);

      res.send(html);
    });
  });
});

// Rota para adicionar um livro aos favoritos
app.post('/add-favorite', isAuthenticated, (req, res) => {
    const { title, author, imageUrl } = req.body;
    const userId = req.session.userId;

    // Verificar se o livro já está nos favoritos
    const checkFavoriteSql = 'SELECT * FROM favoritos WHERE user_id = ? AND titulo = ?';
    db.query(checkFavoriteSql, [userId, title], (err, results) => {
        if (err) {
            console.error('Erro ao verificar livro nos favoritos:', err);
            return res.status(500).json({ success: false, message: 'Erro ao verificar livro nos favoritos.' });
        }

        if (results.length > 0) {
            return res.json({ success: false, message: 'Livro já está nos favoritos' });
        }

        // Verificar se o livro já está na biblioteca
        const checkLibrarySql = 'SELECT * FROM livros WHERE user_id = ? AND titulo = ?';
        db.query(checkLibrarySql, [userId, title], (err, results) => {
            if (err) {
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    console.error('Erro ao verificar livro na biblioteca:', err);
                    return res.status(500).json({ success: false, message: 'A tabela de biblioteca não existe. Por favor, contate o suporte.' });
                }
                console.error('Erro ao verificar livro na biblioteca:', err);
                return res.status(500).json({ success: false, message: 'Erro ao verificar livro na biblioteca.' });
            }

            if (results.length > 0) {
                return res.json({ success: false, message: 'Livro já está na biblioteca' });
            }

            // Adicionar livro aos favoritos
            const addFavoriteSql = 'INSERT INTO favoritos (user_id, titulo, autor, imagem) VALUES (?, ?, ?, ?)';
            db.query(addFavoriteSql, [userId, title, author, imageUrl], (err, results) => {
                if (err) {
                    console.error('Erro ao adicionar livro aos favoritos:', err);
                    return res.status(500).json({ success: false, message: 'Erro ao adicionar livro aos favoritos.' });
                }

                res.json({ success: true, message: 'Livro adicionado aos favoritos com sucesso.' });
            });
        });
    });
});

app.get('/catalog', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Catalog.html'));
});

// Rota para redirecionar para a página de catálogo
app.get('/catalog-data', (req, res) => {
  // Consulta para buscar os livros mais populares
  const popularBooksSql = `
    SELECT google_books_id, COUNT(*) as count
    FROM livros
    GROUP BY google_books_id
    ORDER BY count DESC
    LIMIT 10
  `;

  // Consulta para buscar os últimos livros adicionados
  const latestBooksSql = `
    SELECT google_books_id
    FROM livros
    ORDER BY data_adicao DESC
    LIMIT 10
  `;

  db.query(popularBooksSql, (err, popularBooks) => {
    if (err) {
      console.error('Erro ao buscar livros mais populares:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar livros mais populares.' });
    }

    db.query(latestBooksSql, (err, latestBooks) => {
      if (err) {
        console.error('Erro ao buscar últimos livros adicionados:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar últimos livros adicionados.' });
      }

      // Buscar detalhes dos livros na API do Google Books
      const googleBooksApiUrl = 'https://www.googleapis.com/books/v1/volumes';
      const popularBooksPromises = popularBooks.map(book => {
        if (book.google_books_id) {
          return axios.get(`${googleBooksApiUrl}/${book.google_books_id}`).then(response => response.data);
        }
        return Promise.resolve(null);
      });
      const latestBooksPromises = latestBooks.map(book => {
        if (book.google_books_id) {
          return axios.get(`${googleBooksApiUrl}/${book.google_books_id}`).then(response => response.data);
        }
        return Promise.resolve(null);
      });

      Promise.all([...popularBooksPromises, ...latestBooksPromises])
        .then(results => {
          const popularBooksDetails = results.slice(0, popularBooks.length).map((result, index) => {
            if (result) {
              return {
                googleBooksId: popularBooks[index].google_books_id,
                title: result.volumeInfo.title,
                author: result.volumeInfo.authors.join(', '),
                imageUrl: result.volumeInfo.imageLinks.thumbnail,
                genres: result.volumeInfo.categories
              };
            }
            return null;
          }).filter(book => book !== null);

          const latestBooksDetails = results.slice(popularBooks.length).map((result, index) => {
            if (result) {
              return {
                googleBooksId: latestBooks[index].google_books_id,
                title: result.volumeInfo.title,
                author: result.volumeInfo.authors.join(', '),
                imageUrl: result.volumeInfo.imageLinks.thumbnail,
                genres: result.volumeInfo.categories
              };
            }
            return null;
          }).filter(book => book !== null);

          res.json({ popularBooks: popularBooksDetails, latestBooks: latestBooksDetails });
        })
        .catch(error => {
          console.error('Erro ao buscar detalhes dos livros na API do Google Books:', error);
          res.status(500).json({ success: false, message: 'Erro ao buscar detalhes dos livros na API do Google Books.' });
        });
    });
  });
});