"use strict";

const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const fs = require('fs');
const axios = require("axios");
const crypto = require('crypto');

const app = express();
const saltRounds = 10; // Número de rounds para bcrypt

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
            books: books // Livros do usuário
          };

          // Renderizar livros com ícone de deletar fixo
          const bookListHTML = profileData.books.map(book => {
            return `
    <div class="swiper-slide book-item" data-book-id="${book.id}" style="position: relative;">
      <img src="${book.imagem || '/img/default-book-image.jpg'}" alt="${book.titulo}" style="width:120px; height:180px;">
      <p><strong>${book.titulo}</strong></p>
      <p>${book.autor}</p>
      <!-- Ícone de deletar fixo -->
      <i class="fas fa-trash-alt delete-icon" title="Deletar" style="position: absolute; top: 10px; right: 10px;"></i>
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
            .replace('{{userBooks}}', bookListHTML);

          res.send(html);
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

// Rota para deletar a conta
app.get('/delete-account', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redireciona para o login se o usuário não estiver logado
  }

  db.query(
    'DELETE FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        console.error('Erro ao deletar a conta:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro no servidor.'
        });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error('Erro ao encerrar a sessão:', err);
          return res.status(500).json({
            success: false,
            message: 'Erro no servidor.'
          });
        }

        res.json({
          success: true,
          message: 'Conta deletada com sucesso!'
        });
      });
    }
  );
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
app.post('/add-book', (req, res) => {
  const { title, author, imageUrl } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }

  if (!title || !author || !imageUrl) {
    return res.json({ success: false, message: 'Título, autor e imagem são obrigatórios' });
  }

  // Verificar se o livro já existe na biblioteca do usuário
  const checkSql = 'SELECT * FROM livros WHERE titulo = ? AND autor = ? AND user_id = ?';
  db.query(checkSql, [title, author, userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'Erro ao verificar a duplicidade do livro' });
    }

    if (results.length > 0) {
      // Se o livro já existe, retorna uma mensagem de erro
      return res.json({ success: false, message: 'Livro já existe na biblioteca' });
    }

    // Caso contrário, insere o livro
    const sql = 'INSERT INTO livros (titulo, autor, imagem, user_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, author, imageUrl, userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.json({ success: false, message: 'Erro ao adicionar o livro' });
      }
      res.json({ success: true, message: 'Livro adicionado com sucesso' });
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

// Configuração da porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta http://localhost:${PORT}`);
});

// Nodemailler 

const { enviarEmailNotificacao } = require('./emailService'); // Importar a função de envio de emails

app.post('/interesse', (req, res) => {
  const { userIdInteressado, livroId } = req.body;

  // Verificar se os campos necessários foram fornecidos
  if (!userIdInteressado || !livroId) {
    return res.status(400).json({ success: false, message: 'ID do usuário interessado e ID do livro são obrigatórios.' });
  }

  // Consultar o banco de dados para obter o email do dono do livro
  const sql = `
    SELECT u.email, l.titulo
    FROM users u
    JOIN livros l ON u.id = l.user_id
    WHERE l.id = ?
  `;

  db.query(sql, [livroId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar email do dono do livro:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    const { email, titulo } = results[0];

    // Enviar notificação por email
    enviarEmailNotificacao(email, titulo);

    res.status(200).json({ success: true, message: 'Interesse registrado e notificação enviada.' });
  });
});