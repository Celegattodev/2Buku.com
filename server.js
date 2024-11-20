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
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { format } = require('date-fns');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: 'deyhmso1q',
  api_key: '381135375669254',
  api_secret: 'uK5-DsaLjd5AfIH3w4_VdjyuBl0'
});

// Gera uma chave secreta aleatória para a sessão
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Configura o engine de visualização para EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configura o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'assets/js')));
app.use('/img', express.static(path.join(__dirname, 'assets/img')));

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
app.get("/addBook", isAuthenticated, (req, res) => {
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
      user.city = cityName;

      // Consulta para buscar os livros do usuário, incluindo a imagem e filtrando pelo status "Disponível"
      db.query('SELECT id, titulo, autor, imagem FROM livros WHERE user_id = ? AND status = "Disponível"', [req.session.userId], (err, books) => {
        if (err) {
          console.error('Erro ao buscar livros do usuário:', err);
          return res.status(500).send('Erro ao buscar livros.');
        }

        // Consulta para buscar os livros favoritos do usuário
        db.query('SELECT id, titulo, autor, imagem FROM favoritos WHERE user_id = ?', [req.session.userId], (err, favorites) => {
          if (err) {
            console.error('Erro ao buscar livros desejados do usuário:', err);
            return res.status(500).send('Erro ao buscar livros desejados.');
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

// Rota para processar o login
app.post("/login", (req, res) => {
  const { email, password, adminLogin } = req.body;

  // Verifique se os campos de email e senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email e senha são obrigatórios."
    });
  }

  // Consulta ao banco de dados para verificar se o email existe
  const table = adminLogin ? "admins" : "users";
  db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, results) => {
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

      // Se a senha for válida, verificar o status da conta
      if (isMatch) {
        if (user.status === 'banido') {
          return res.status(403).json({
            success: false,
            status: 'banido',
            message: 'Sua conta foi banida permanentemente. Caso tenha dúvidas, entre em contato pelo email buku.livro@gmail.com.'
          });
        }

        if (user.status === 'suspenso' && user.suspension_expiry && new Date(user.suspension_expiry) > new Date()) {
          const formattedDate = format(new Date(user.suspension_expiry), 'dd/MM/yyyy HH:mm:ss');
          return res.status(403).json({
            success: false,
            status: 'suspenso',
            token_expiry: formattedDate,
            message: `Sua conta está suspensa até ${formattedDate}. Caso tenha dúvidas, entre em contato pelo email buku.livro@gmail.com.`
          });
        }

        // Armazene o ID do usuário na sessão
        req.session.userId = user.id; // Certifique-se de que o ID está correto
        req.session.isAdmin = adminLogin; // Adicionar flag para verificar se é admin

        // Verificar se é login de administrador
        if (adminLogin) {
          // Gerar código de verificação
          const codigoVerificacao = Math.floor(100000 + Math.random() * 900000).toString();
          req.session.codigoVerificacao = codigoVerificacao;
          req.session.tentativas = 0;
          req.session.bloqueadoAte = null;
          req.session.verificado = false; // Adicionar flag de verificação

          // Enviar código de verificação por e-mail
          enviarCodigoVerificacao(user.email, codigoVerificacao);

          return res.status(200).json({
            success: true,
            message: 'Login de administrador bem-sucedido. Código de verificação enviado por e-mail.',
            redirect: '/adminVerify'
          });
        }

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

// Middleware para verificar se o usuário está autenticado e é administrador
const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login'); // Redireciona para login se não estiver autenticado ou não for admin
  }
};

// Middleware para verificar se o usuário está autenticado e não é administrador
const isUser = (req, res, next) => {
  if (req.session.userId && !req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login'); // Redireciona para login se não estiver autenticado ou for admin
  }
};

// Rota para enviar o arquivo admin.html
app.get('/admin', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Rota para enviar o arquivo userProfile.html
app.get('/profile', isUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'userProfile.html'));
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
          const userName = name; // ou qualquer variável que contenha o nome do usuário
          enviarEmailComTemplate(email, 'Conta criada na Buku', 'templateContaCriada', { userName });

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
  const userId = req.session.userId;

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

      // Obter o email e o nome do usuário para enviar o email de confirmação
      db.query('SELECT email, name FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          return res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do usuário.'
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuário não encontrado.'
          });
        }

        const { email, name: userName } = results[0];

        enviarEmailComTemplate(email, 'Dados alterados', 'templateDadosAlterados', { userName });

        res.status(200).json({
          success: true,
          message: 'Perfil atualizado com sucesso!'
        });
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
  const { password } = req.body;

  // Obter a senha do usuário antes de deletar
  db.query('SELECT email, name, password FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar usuário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const { email, name, password: hashedPassword } = results[0];

    // Verificar a senha
    bcrypt.compare(password, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        return res.status(500).json({ success: false, message: 'Erro ao verificar senha.' });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'A senha fornecida está incorreta. Por favor, tente novamente.' });
      }

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
            const userName = name;
            enviarEmailComTemplate(email, 'Sua conta foi deletada', 'templateContaDeletada', { userName });

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
});

// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ success: false, message: 'Erro ao fazer logout.' });
    }
    res.redirect('/login'); // Redireciona para a página de login após o logout
  });
});

// Rota para a página de política de privacidade
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'privacy-policy.html'));
});

app.get('/some-route', (req, res) => {
  res.redirect('/privacy-policy');
});

// Verificar se o livro já existe na biblioteca
app.post('/check-book', isAuthenticated, (req, res) => {
  const { googleBooksId } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
  }

  const checkLibrarySql = 'SELECT * FROM livros WHERE google_books_id = ? AND user_id = ?';
  db.query(checkLibrarySql, [googleBooksId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao verificar a duplicidade do livro' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Livro já existe na biblioteca' });
    }

    res.status(200).json({ success: true, message: 'Livro não existe na biblioteca' });
  });
});

// Configuração do multer para armazenar as imagens
const storage = multer.memoryStorage(); // Armazenar as imagens na memória temporariamente

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB por arquivo
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  }
}).array('bookImages', 8); // Limite de 8 imagens

// Rota para adicionar um livro à biblioteca
app.post('/add-book', isAuthenticated, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const { googleBooksId, title, author, imageUrl } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    if (!googleBooksId || !title || !author || !imageUrl) {
      return res.status(400).json({ success: false, message: 'ID do Google Books, título, autor e imagem são obrigatórios' });
    }

    if (!req.files || req.files.length < 3) {
      return res.status(400).json({ success: false, message: 'É necessário anexar pelo menos 3 imagens do estado do livro' });
    }

    // Verificar se o livro já está nos favoritos
    const checkFavoriteSql = 'SELECT * FROM favoritos WHERE google_books_id = ? AND user_id = ?';
    db.query(checkFavoriteSql, [googleBooksId, userId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao verificar os desejados' });
      }

      if (results.length > 0) {
        return res.status(409).json({ success: false, message: 'Livro já está nos desejados' });
      }

      // Verificar se o livro já está na biblioteca
      const checkLibrarySql = 'SELECT * FROM livros WHERE google_books_id = ? AND user_id = ?';
      db.query(checkLibrarySql, [googleBooksId, userId], async (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Erro ao verificar a duplicidade do livro' });
        }

        if (results.length > 0) {
          return res.status(409).json({ success: false, message: 'Livro já existe na biblioteca' });
        }

        const sql = 'INSERT INTO livros (google_books_id, titulo, autor, imagem, user_id, data_adicao) VALUES (?, ?, ?, ?, ?, NOW())';
        db.query(sql, [googleBooksId, title, author, imageUrl, userId], async (err, result) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao adicionar o livro' });
          }

          const livroId = result.insertId;
          const imageUrls = [];

          try {
            for (const file of req.files) {
              // Redimensionar a imagem usando sharp
              const buffer = await sharp(file.buffer)
                .resize(800, 800, { fit: 'inside' }) // Redimensionar para 800x800 sem perder a qualidade
                .toBuffer();

              const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                });
                uploadStream.end(buffer);
              });
              imageUrls.push(uploadResult.secure_url);
            }
          } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao fazer upload das imagens' });
          }

          const imageSql = 'INSERT INTO livro_imagens (livro_id, user_id, imagem_url) VALUES ?';
          const imageValues = imageUrls.map(url => [livroId, userId, url]);

          db.query(imageSql, [imageValues], (err) => {
            if (err) {
              return res.status(500).json({ success: false, message: 'Erro ao salvar as imagens do livro' });
            }

            res.status(201).json({ success: true, message: 'Livro adicionado com sucesso' });
          });
        });
      });
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

// Rota para adicionar um livro aos favoritos
app.post('/add-favorite', isAuthenticated, async (req, res) => {
  const { googleBooksId, title, author, imageUrl } = req.body;
  const userId = req.session.userId;

  console.log('Recebido para adicionar aos desejados:', { googleBooksId, title, author, imageUrl, userId });

  if (!googleBooksId) {
    console.error('ID do livro é obrigatório.');
    return res.status(400).json({ success: false, message: 'ID do livro é obrigatório.' });
  }

  try {
    // Verificar se o livro já está na biblioteca
    const checkLibrarySql = 'SELECT * FROM livros WHERE user_id = ? AND google_books_id = ?';
    const [libraryResults] = await db.promise().query(checkLibrarySql, [userId, googleBooksId]);

    if (libraryResults.length > 0) {
      console.log('Livro já está na biblioteca.');
      return res.status(400).json({ success: false, message: 'Livro já está na biblioteca.' });
    }

    // Verificar se o livro já está nos favoritos
    const checkFavoriteSql = 'SELECT * FROM favoritos WHERE user_id = ? AND google_books_id = ?';
    const [favoriteResults] = await db.promise().query(checkFavoriteSql, [userId, googleBooksId]);

    if (favoriteResults.length > 0) {
      console.log('Livro já está nos desejados.');
      return res.status(400).json({ success: false, message: 'Livro já está nos desejados.' });
    }

    // Adicionar o livro aos favoritos
    const addFavoriteSql = 'INSERT INTO favoritos (google_books_id, titulo, autor, imagem, user_id) VALUES (?, ?, ?, ?, ?)';
    await db.promise().query(addFavoriteSql, [googleBooksId, title, author, imageUrl, userId]);

    console.log('Livro adicionado aos desejados com sucesso.');
    res.json({ success: true, message: 'Livro adicionado aos desejados com sucesso.' });
  } catch (err) {
    console.error('Erro ao adicionar o livro aos desejados:', err);
    res.status(500).json({ success: false, message: 'Erro ao adicionar o livro aos desejados.' });
  }
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

      // Obter o nome do usuário
      const user = results[0];
      const userName = user.name;

      // Renderizar o template EJS com o token e o nome do usuário
      ejs.renderFile(path.join(__dirname, 'views', 'templateAlterarSenha.ejs'), { userName, resetToken }, (err, html) => {
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
    const userName = name;
    enviarEmailComTemplate(email, 'Senha alterada com sucesso', 'templateSenhaAlterada', { userName });
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
  db.query('SELECT id, titulo, autor, imagem, google_books_id FROM favoritos WHERE user_id = ?', [req.session.userId], (err, favorites) => {
    if (err) {
      console.error('Erro ao buscar livros desejados do usuário:', err);
      return res.status(500).send('Erro ao buscar livros desejados.');
    }

    // Renderizar a página de favoritos com os livros favoritos do usuário
    res.sendFile(path.join(__dirname, 'views', 'favorites.html'));
  });
});

// Rota para obter os detalhes do livro para o catálogo
app.get('/api/catalog-book-details/:googleBooksId', isAuthenticated, async (req, res) => {
  const googleBooksId = req.params.googleBooksId;

  try {
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`;
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const volumeInfo = googleBooksResponse.data.volumeInfo;

    const bookDescription = volumeInfo.description || 'Descrição não disponível';
    const bookCategories = volumeInfo.categories || ['Desconhecido'];
    const bookPublisher = volumeInfo.publisher || 'Desconhecido';
    const bookPublishedDate = volumeInfo.publishedDate || 'Desconhecido';
    const bookTitle = volumeInfo.title || 'Título não disponível';
    const bookAuthors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido';
    const bookCoverImage = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '/img/default-book-image.jpg';

    // Buscar o ID do livro na tabela livros
    const getBookIdSql = 'SELECT id FROM livros WHERE google_books_id = ?';
    const [bookIdResults] = await db.promise().query(getBookIdSql, [googleBooksId]);
    if (bookIdResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }
    const livroId = bookIdResults[0].id;

    // Buscar as imagens do livro na tabela livro_imagens
    const getImagesSql = 'SELECT imagem_url FROM livro_imagens WHERE livro_id = ?';
    const [imagesResults] = await db.promise().query(getImagesSql, [livroId]);
    const bookImages = imagesResults.map(row => row.imagem_url);

    res.status(200).json({
      success: true,
      book: {
        title: bookTitle,
        author: bookAuthors,
        description: bookDescription,
        categories: bookCategories,
        publisher: bookPublisher,
        publishedDate: bookPublishedDate,
        coverImage: bookCoverImage,
        images: bookImages // Adicionar as imagens à resposta
      }
    });
  } catch (err) {
    console.error('Erro ao carregar os detalhes do livro:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar os detalhes do livro.' });
  }
});

// Rota para buscar os livros favoritos do usuário
app.get('/api/user-favorites', isAuthenticated, (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  // Consulta para buscar os livros favoritos do usuário
  db.query('SELECT id, titulo, autor, imagem, google_books_id FROM favoritos WHERE user_id = ?', [req.session.userId], (err, favorites) => {
    if (err) {
      console.error('Erro ao buscar livros desejados do usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar livros desejados.' });
    }

    // Retornar os livros favoritos do usuário em formato JSON
    res.status(200).json({ success: true, favorites });
  });
});

// Rota para adicionar um livro aos favoritos
app.post('/add-favorite', isAuthenticated, (req, res) => {
  const { googleBooksId, title, author, imageUrl } = req.body;
  const userId = req.session.userId;

  console.log('Recebido para adicionar aos desejados:', { googleBooksId, title, author, imageUrl, userId });

  if (!googleBooksId) {
    console.error('ID do livro é obrigatório.');
    return res.status(400).json({ success: false, message: 'ID do livro é obrigatório.' });
  }

  // Verificar se o livro já está na biblioteca
  const checkLibrarySql = 'SELECT * FROM livros WHERE user_id = ? AND google_books_id = ?';
  db.query(checkLibrarySql, [userId, googleBooksId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar a biblioteca:', err);
      return res.status(500).json({ success: false, message: 'Erro ao verificar a biblioteca.' });
    }

    if (results.length > 0) {
      console.log('Livro já está na biblioteca.');
      return res.status(400).json({ success: false, message: 'Livro já está na biblioteca.' });
    }

    // Verificar se o livro já está nos favoritos
    const checkFavoriteSql = 'SELECT * FROM favoritos WHERE user_id = ? AND google_books_id = ?';
    db.query(checkFavoriteSql, [userId, googleBooksId], (err, results) => {
      if (err) {
        console.error('Erro ao verificar os desejados:', err);
        return res.status(500).json({ success: false, message: 'Erro ao verificar os desejados.' });
      }

      if (results.length > 0) {
        console.log('Livro já está nos desejados.');
        return res.status(400).json({ success: false, message: 'Livro já está nos desejados.' });
      }

      // Adicionar o livro aos favoritos
      const addFavoriteSql = 'INSERT INTO favoritos (google_books_id, titulo, autor, imagem, user_id) VALUES (?, ?, ?, ?, ?)';
      db.query(addFavoriteSql, [googleBooksId, title, author, imageUrl, userId], (err, results) => {
        if (err) {
          console.error('Erro ao adicionar o livro aos desejados:', err);
          return res.status(500).json({ success: false, message: 'Erro ao adicionar o livro aos desejados.' });
        }

        console.log('Livro adicionado aos desejados com sucesso.');
        res.json({ success: true, message: 'Livro adicionado aos desejado com sucesso.' });
      });
    });
  });
});

// Rota para remover um livro dos favoritos
app.delete('/remove-favorite/:id', isAuthenticated, (req, res) => {
  const bookId = req.params.id;
  const userId = req.session.userId;

  const deleteFavoriteSql = 'DELETE FROM favoritos WHERE id = ? AND user_id = ?';
  db.query(deleteFavoriteSql, [bookId, userId], (err, results) => {
    if (err) {
      console.error('Erro ao deletar livro dos desejados:', err);
      return res.status(500).json({ success: false, message: 'Erro ao deletar livro dos desejados.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado nos favoritos.' });
    }

    res.json({ success: true, message: 'Livro deletado dos favoritos com sucesso.' });
  });
});

app.get('/catalog', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Catalog.html'));
});

// Rota para redirecionar para a página de catálogo
app.get('/catalog-data', (req, res) => {
  // Consulta para buscar os livros mais populares e incluir o user_id do proprietário
  const popularBooksSql = `
    SELECT google_books_id, user_id, COUNT(*) as count
    FROM livros
    WHERE status = 'Disponível'
    GROUP BY google_books_id, user_id
    ORDER BY count DESC
    LIMIT 10
  `;

  // Consulta para buscar os últimos livros adicionados, incluindo o user_id do proprietário
  const latestBooksSql = `
    SELECT google_books_id, user_id
    FROM livros
    WHERE status = 'Disponível'
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

      // Fazer chamadas à API Google Books para buscar detalhes dos livros
      const googleBooksApiUrl = 'https://www.googleapis.com/books/v1/volumes';
      const popularBooksPromises = popularBooks.map(book => {
        if (book.google_books_id) {
          return axios.get(`${googleBooksApiUrl}/${book.google_books_id}`).then(response => ({
            ...response.data,
            userId: book.user_id // Inclua o userId diretamente aqui
          }));
        }
        return Promise.resolve(null);
      });
      const latestBooksPromises = latestBooks.map(book => {
        if (book.google_books_id) {
          return axios.get(`${googleBooksApiUrl}/${book.google_books_id}`).then(response => ({
            ...response.data,
            userId: book.user_id // Inclua o userId diretamente aqui
          }));
        }
        return Promise.resolve(null);
      });

      Promise.all([...popularBooksPromises, ...latestBooksPromises])
        .then(results => {
          const popularBooksDetails = results.slice(0, popularBooks.length).map((result, index) => {
            const volumeInfo = result && result.volumeInfo;
            return volumeInfo ? {
              googleBooksId: popularBooks[index].google_books_id,
              title: volumeInfo.title || 'Título não disponível',
              author: volumeInfo.authors && volumeInfo.authors.length > 0 ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
              imageUrl: volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail ? volumeInfo.imageLinks.thumbnail : '/img/default-book-image.jpg',
              genres: volumeInfo.categories && volumeInfo.categories.length > 0 ? volumeInfo.categories : ['Gênero desconhecido'],
              userId: popularBooks[index].user_id
            } : null;
          }).filter(book => book !== null);

          const latestBooksDetails = results.slice(popularBooks.length).map((result, index) => {
            const volumeInfo = result && result.volumeInfo;
            return volumeInfo ? {
              googleBooksId: latestBooks[index].google_books_id,
              title: volumeInfo.title || 'Título não disponível',
              author: volumeInfo.authors && volumeInfo.authors.length > 0 ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
              imageUrl: volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail ? volumeInfo.imageLinks.thumbnail : '/img/default-book-image.jpg',
              genres: volumeInfo.categories && volumeInfo.categories.length > 0 ? volumeInfo.categories : ['Gênero desconhecido'],
              userId: latestBooks[index].user_id
            } : null;
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

// Rota para obter os livros do usuário logado
app.get('/api/user-books', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  db.query('SELECT id, titulo, autor, imagem AS imageUrl, google_books_id FROM livros WHERE user_id = ? AND status = "Disponível"', [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar livros do usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar livros do usuário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Nenhum livro encontrado.' });
    }

    res.json({ success: true, userId: userId, books: results });
  });
});

// Rota para solicitar troca
app.post('/api/request-exchange', isAuthenticated, (req, res) => {
  const { googleBooksId, sendingBookId } = req.body;
  const userId = req.session.userId;

  // Verificar se os IDs foram fornecidos
  if (!googleBooksId || !sendingBookId) {
    console.error('IDs são obrigatórios.');
    console.log(`Recebido: Livro Recebedor Google Books ID ${googleBooksId}, Livro Solicitante ID ${sendingBookId}`);
    return res.status(400).json({ success: false, message: 'IDs são obrigatórios.' });
  }

  console.log(`Recebendo solicitação de troca: Usuario Solicitante ID ${userId}, Livro Recebedor Google Books ID ${googleBooksId}, Livro Solicitante ID ${sendingBookId}`);

  // Obter o ID do usuário dono do livro que está recebendo a solicitação
  const getUserSql = 'SELECT user_id, id, titulo, imagem FROM livros WHERE google_books_id = ?';
  db.query(getUserSql, [googleBooksId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dono do livro:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar dono do livro.' });
    }

    if (results.length === 0) {
      console.error('Livro não encontrado.');
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    const receivingUserId = results[0].user_id;

    // Verificar se o livro pertence ao usuário logado
    if (receivingUserId === userId) {
      console.error('Usuário tentando solicitar troca para seu próprio livro.');
      return res.status(400).json({ success: false, message: 'Você não pode solicitar troca para seu próprio livro.' });
    }

    const receivingBookId = results[0].id;
    const receivingBookTitle = results[0].titulo;
    const receivingBookImage = results[0].imagem;

    // Verificar se já existe uma solicitação de troca recente (menos de 24 horas) para o mesmo livro
    const checkRecentExchangeSql = `
            SELECT * FROM trocas 
            WHERE usuario_solicitante_id = ? 
            AND livro_recebedor_id = ? 
            AND timestampdiff(HOUR, data_solicitacao, NOW()) < 24
        `;
    db.query(checkRecentExchangeSql, [userId, receivingBookId], (err, recentExchanges) => {
      if (err) {
        console.error('Erro ao verificar trocas recentes:', err);
        return res.status(500).json({ success: false, message: 'Erro ao verificar trocas recentes.' });
      }

      if (recentExchanges.length > 0) {
        console.error('Já existe uma solicitação de troca recente para este livro.');
        return res.status(400).json({ success: false, message: 'Você já enviou uma solicitação de troca para este livro nas últimas 24 horas. Por favor, aguarde a resposta do outro usuário.' });
      }

      // Gerar token único e data de expiração
      const token = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas a partir de agora

      // Obter informações do livro solicitado e do livro ofertado
      const getBookDetailsSql = 'SELECT titulo, autor, imagem FROM livros WHERE id = ?';
      db.query(getBookDetailsSql, [sendingBookId], (err, bookResults) => {
        if (err) {
          console.error('Erro ao buscar informações do livro ofertado:', err);
          return res.status(500).json({ success: false, message: 'Erro ao buscar informações do livro ofertado.' });
        }

        if (bookResults.length === 0) {
          console.error('Livro ofertado não encontrado.');
          return res.status(404).json({ success: false, message: 'Livro ofertado não encontrado.' });
        }

        const bookOffered = bookResults[0].titulo;
        const bookOfferedAuthor = bookResults[0].autor;
        const bookOfferedImage = bookResults[0].imagem;

        // Inserir a solicitação de troca na tabela de trocas
        const sql = `
                    INSERT INTO trocas (usuario_solicitante_id, usuario_recebedor_id, livro_solicitante_id, livro_recebedor_id, token, token_expiry, data_solicitacao)
                    VALUES (?, ?, ?, ?, ?, ?, NOW())
                `;
        db.query(sql, [userId, receivingUserId, sendingBookId, receivingBookId, token, tokenExpiry], (err, results) => {
          if (err) {
            console.error('Erro ao inserir solicitação de troca:', err);
            return res.status(500).json({ success: false, message: 'Erro ao inserir solicitação de troca.' });
          }

          console.log(`Solicitação de troca enviada com sucesso: Usuario Solicitante ID ${userId}, Usuário Recebedor ID ${receivingUserId}, Livro Solicitante ID ${sendingBookId}, Livro Recebedor ID ${receivingBookId}`);

          // Obter as informações de contato do usuário recebedor
          const getUserContactSql = 'SELECT email, name FROM users WHERE id = ?';
          db.query(getUserContactSql, [receivingUserId], (err, userResults) => {
            if (err) {
              console.error('Erro ao buscar informações de contato do usuário:', err);
              return res.status(500).json({ success: false, message: 'Erro ao buscar informações de contato do usuário.' });
            }

            if (userResults.length === 0) {
              console.error('Usuário não encontrado.');
              return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
            }

            const userContact = userResults[0];
            const email = userContact.email;
            const name = userContact.name;

            // Renderizar o template e enviar o e-mail
            ejs.renderFile(path.join(__dirname, 'views', 'templateLivroSolicitado.ejs'), {
              nomeDoSolicitante: name,
              nomeDoLivro: receivingBookTitle,
              nomeDoLivroOfertado: bookOffered,
              autorDoLivroOfertado: bookOfferedAuthor,
              link: `http://localhost:3000/troca?token=${token}`
            }, (err, html) => {
              if (err) {
                console.error('Erro ao renderizar o template:', err);
                return res.status(500).json({ success: false, message: 'Erro ao renderizar o template.' });
              }

              const mailOptions = {
                from: '"Buku 📚" <buku.livro@gmail.com>',
                to: email,
                subject: 'Solicitação de Troca de Livro',
                html: html
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  console.error('Erro ao enviar o e-mail:', err);
                  return res.status(500).json({ success: false, message: 'Erro ao enviar o e-mail.' });
                }

                console.log('E-mail enviado:', info.response);
                res.json({ success: true, message: 'Solicitação de troca enviada com sucesso.' });
              });
            });
          });
        });
      });
    });
  });
});

// Rota para obter os detalhes da troca
app.get('/api/exchange-details/:token', async (req, res) => {
  const token = req.params.token;

  const getExchangeDetailsSql = `
    SELECT t.usuario_solicitante_id, t.livro_solicitante_id, t.livro_recebedor_id, u.name, u.phone, u.city, u.state, 
           l_solicitante.titulo AS titulo_solicitante, l_solicitante.autor AS autor_solicitante, l_solicitante.imagem AS imagem_solicitante,
           l_recebedor.titulo AS titulo_recebedor, l_recebedor.autor AS autor_recebedor, l_recebedor.imagem AS imagem_recebedor,
           t.token_expiry
    FROM trocas t
    JOIN users u ON t.usuario_solicitante_id = u.id
    JOIN livros l_solicitante ON t.livro_solicitante_id = l_solicitante.id
    JOIN livros l_recebedor ON t.livro_recebedor_id = l_recebedor.id
    WHERE t.token = ?
  `;

  try {
    const [results] = await db.promise().query(getExchangeDetailsSql, [token]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Troca não encontrada.' });
    }

    const exchangeDetails = results[0];
    const currentTime = new Date();

    if (currentTime > exchangeDetails.token_expiry) {
      return res.status(400).json({ success: false, message: 'Token expirado.' });
    }

    const cityName = await getCityNameById(exchangeDetails.state, exchangeDetails.city);

    res.json({
      success: true,
      user: {
        name: exchangeDetails.name,
        phone: exchangeDetails.phone,
        city: cityName,
        state: exchangeDetails.state
      },
      book: { // Livro ofertado
        id: exchangeDetails.livro_solicitante_id, // Adicione o ID do livro ofertado
        title: exchangeDetails.titulo_solicitante,
        author: exchangeDetails.autor_solicitante,
        imageUrl: exchangeDetails.imagem_solicitante
      },
      requestedBook: { // Livro solicitado
        id: exchangeDetails.livro_recebedor_id, // Adicione o ID do livro solicitado
        title: exchangeDetails.titulo_recebedor,
        author: exchangeDetails.autor_recebedor,
        imageUrl: exchangeDetails.imagem_recebedor
      }
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes da troca:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar detalhes da troca.' });
  }
});



// Rota para acessar a página de troca
app.get('/troca', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'troca.html'));
});

// Rota para acessar a página do usuário proprietario do livro
app.get('/ownerUser', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ownerUser.html'));
});

// Rota para obter os detalhes do livro para a troca
app.get('/api/exchange-book-details/:bookId', isAuthenticated, async (req, res) => {
  const bookId = req.params.bookId;

  try {
    // Buscar os detalhes do livro na tabela livros
    const getBookDetailsSql = 'SELECT * FROM livros WHERE id = ?';
    const [bookResults] = await db.promise().query(getBookDetailsSql, [bookId]);

    if (bookResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    const book = bookResults[0];

    // Buscar a descrição do livro usando a Google Books API
    const googleBooksId = book.google_books_id;
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`;
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const volumeInfo = googleBooksResponse.data.volumeInfo;

    const bookDescription = volumeInfo.description || 'Descrição não disponível';
    const bookCategories = volumeInfo.categories || ['Desconhecido'];
    const bookPublisher = volumeInfo.publisher || 'Desconhecido';
    const bookPublishedDate = volumeInfo.publishedDate || 'Desconhecido';

    // Buscar as imagens do livro na tabela livro_imagens
    const getImagesSql = 'SELECT imagem_url FROM livro_imagens WHERE livro_id = ?';
    const [imagesResults] = await db.promise().query(getImagesSql, [bookId]);
    const bookImages = imagesResults.map(row => row.imagem_url);

    res.status(200).json({
      success: true,
      book: {
        id: book.id,
        title: book.titulo,
        author: book.autor,
        description: bookDescription,
        categories: bookCategories,
        publisher: bookPublisher,
        publishedDate: bookPublishedDate,
        coverImage: book.imagem,
        images: bookImages
      }
    });
  } catch (err) {
    console.error('Erro ao carregar os detalhes do livro:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar os detalhes do livro.' });
  }
});

// Rota para obter os detalhes da troca
app.get('/api/exchange-details/:exchangeId', isAuthenticated, (req, res) => {
  const exchangeId = req.params.exchangeId;

  const getExchangeDetailsSql = `
    SELECT t.usuario_solicitante_id, t.livro_solicitante_id, u.name, u.phone, u.city, u.state, l.titulo, l.imagem
    FROM trocas t
    JOIN users u ON t.usuario_solicitante_id = u.id
    JOIN livros l ON t.livro_solicitante_id = l.id
    WHERE t.id = ?
  `;

  db.query(getExchangeDetailsSql, [exchangeId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar detalhes da troca:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar detalhes da troca.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Troca não encontrada.' });
    }

    const exchangeDetails = results[0];
    res.json({
      success: true,
      user: {
        name: exchangeDetails.name,
        phone: exchangeDetails.phone,
        city: exchangeDetails.city,
        state: exchangeDetails.state
      },
      book: {
        title: exchangeDetails.titulo,
        imageUrl: exchangeDetails.imagem
      }
    });
  });
});


// Rota para processar a ação de aceitar ou recusar a troca
app.post('/api/exchange-action', isAuthenticated, async (req, res) => {
  const { token, action } = req.body;

  const getExchangeDetailsSql = `
      SELECT t.id, t.usuario_solicitante_id, t.usuario_recebedor_id, t.livro_solicitante_id, t.livro_recebedor_id, 
             u.email AS solicitante_email, u.name AS solicitante_name, u.phone AS solicitante_phone, 
             ur.email AS recebedor_email, ur.name AS recebedor_name, ur.phone AS recebedor_phone,
             l_solicitante.titulo AS solicitante_book_title, l_recebedor.titulo AS recebedor_book_title,
             t.status
      FROM trocas t
      JOIN users u ON t.usuario_solicitante_id = u.id
      JOIN users ur ON t.usuario_recebedor_id = ur.id
      JOIN livros l_solicitante ON t.livro_solicitante_id = l_solicitante.id
      JOIN livros l_recebedor ON t.livro_recebedor_id = l_recebedor.id
      WHERE t.token = ?
  `;

  try {
    const [results] = await db.promise().query(getExchangeDetailsSql, [token]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Troca não encontrada.' });
    }

    const exchangeDetails = results[0];

    // Verifica se a troca já foi processada
    if (exchangeDetails.status !== 'Pendente') {
      return res.status(400).json({ success: false, message: 'Troca já foi processada.' });
    }

    if (action === 'accept') {
      // Atualizar o status da troca para "Aceito"
      const updateExchangeSql = 'UPDATE trocas SET status = "Aceito" WHERE id = ?';
      await db.promise().query(updateExchangeSql, [exchangeDetails.id]);

      // Atualizar o status dos livros envolvidos na troca para "Trocado"
      const updateBooksSql = 'UPDATE livros SET status = "Trocado" WHERE id IN (?, ?)';
      await db.promise().query(updateBooksSql, [exchangeDetails.livro_solicitante_id, exchangeDetails.livro_recebedor_id]);

      // Enviar email de confirmação para ambos os usuários
      const solicitanteEmail = exchangeDetails.solicitante_email;
      const recebedorEmail = exchangeDetails.recebedor_email;
      const solicitanteName = exchangeDetails.solicitante_name;
      const recebedorName = exchangeDetails.recebedor_name;
      const solicitanteBookTitle = exchangeDetails.solicitante_book_title;
      const recebedorBookTitle = exchangeDetails.recebedor_book_title;

      await enviarEmailComTemplate(solicitanteEmail, 'Troca Aceita', 'templateTrocaAceita', {
        userName: solicitanteName,
        otherUserName: recebedorName,
        userBookTitle: solicitanteBookTitle,
        otherUserBookTitle: recebedorBookTitle,
        otherUserEmail: recebedorEmail,
        otherUserPhone: exchangeDetails.recebedor_phone
      });
      await enviarEmailComTemplate(recebedorEmail, 'Troca Aceita', 'templateTrocaAceita', {
        userName: recebedorName,
        otherUserName: solicitanteName,
        userBookTitle: recebedorBookTitle,
        otherUserBookTitle: solicitanteBookTitle,
        otherUserEmail: solicitanteEmail,
        otherUserPhone: exchangeDetails.solicitante_phone
      });

      return res.json({ success: true, message: 'Troca aceita com sucesso! Entre em contato com o outro usuário para combinar a entrega.' });
    }

    if (action === 'deny') {
      // Atualizar o status da troca para "Recusada"
      const updateExchangeSql = 'UPDATE trocas SET status = "Recusada" WHERE id = ?';
      await db.promise().query(updateExchangeSql, [exchangeDetails.id]);

      // Enviar email de notificação para ambos os usuários
      const solicitanteEmail = exchangeDetails.solicitante_email;
      const recebedorEmail = exchangeDetails.recebedor_email;
      const solicitanteName = exchangeDetails.solicitante_name;
      const recebedorName = exchangeDetails.recebedor_name;

      await enviarEmailComTemplate(solicitanteEmail, 'Troca Recusada', 'templateTrocaNegada', {
        userName: solicitanteName,
        otherUserName: recebedorName,
      });
      await enviarEmailComTemplate(recebedorEmail, 'Troca Recusada', 'templateTrocaNegada', {
        userName: recebedorName,
        otherUserName: solicitanteName,
      });

      return res.json({ success: true, message: 'Troca recusada com sucesso!' });
    }

    return res.status(400).json({ success: false, message: 'Ação inválida.' });
  } catch (err) {
    console.error('Erro ao processar a ação da troca:', err);
    return res.status(500).json({ success: false, message: 'Erro ao processar a ação da troca.' });
  }
});

// Rota para obter os detalhes do perfil do usuário proprietário
app.get('/api/ownerUser/:userId', isAuthenticated, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Consulta para obter os detalhes do usuário
    const userSql = 'SELECT name, email, state, city, phone, biography, photo AS profileImage FROM users WHERE id = ?';
    const [userResults] = await db.promise().query(userSql, [userId]);

    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    const user = userResults[0];

    // Obter o nome da cidade usando o código da cidade e do estado
    const cityName = await getCityNameById(user.state, user.city);
    user.city = cityName;

    // Consulta para obter os livros do usuário com status "Disponível"
    const booksSql = 'SELECT id, titulo, autor, imagem AS imageUrl FROM livros WHERE user_id = ? AND status = "Disponível"';
    const [booksResults] = await db.promise().query(booksSql, [userId]);

    // Consulta para obter os livros favoritos do usuário
    const favoritesSql = 'SELECT id, titulo, autor, imagem AS imageUrl FROM favoritos WHERE user_id = ?';
    const [favoritesResults] = await db.promise().query(favoritesSql, [userId]);

    res.json({
      success: true,
      user: user,
      books: booksResults,
      favorites: favoritesResults
    });
  } catch (err) {
    console.error('Erro ao buscar detalhes do usuário:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar detalhes do usuário.' });
  }
});

// Rota para acessar a página do usuário proprietário do livro
app.get('/ownerUser', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ownerUser.html'));
});

// Rota para obter os detalhes do livro
app.get('/api/book-details/:bookId', isAuthenticated, async (req, res) => {
  const bookId = req.params.bookId;

  try {
    const bookSql = 'SELECT * FROM livros WHERE id = ?';
    const [bookResults] = await db.promise().query(bookSql, [bookId]);

    if (bookResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    const book = bookResults[0];

    // Buscar a descrição do livro usando a Google Books API
    const googleBooksId = book.google_books_id;
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`;
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const volumeInfo = googleBooksResponse.data.volumeInfo;

    const bookDescription = volumeInfo.description || 'Descrição não disponível';
    const bookCategories = volumeInfo.categories || ['Desconhecido'];
    const bookPublisher = volumeInfo.publisher || 'Desconhecido';
    const bookPublishedDate = volumeInfo.publishedDate || 'Desconhecido';

    const imagesSql = 'SELECT imagem_url FROM livro_imagens WHERE livro_id = ?';
    const [imageResults] = await db.promise().query(imagesSql, [book.id]);

    const images = imageResults.map(row => row.imagem_url);

    res.status(200).json({
      success: true,
      book: {
        id: book.id,
        title: book.titulo,
        author: book.autor,
        description: bookDescription,
        categories: bookCategories,
        publisher: bookPublisher,
        publishedDate: bookPublishedDate,
        coverImage: book.imagem,
        images: images
      }
    });
  } catch (err) {
    console.error('Erro ao carregar os detalhes do livro:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar os detalhes do livro.' });
  }
});

// Rota para obter os detalhes do livro para o catálogo
app.get('/api/catalog-book-details/:googleBooksId', isAuthenticated, async (req, res) => {
  const googleBooksId = req.params.googleBooksId;

  try {
    const bookSql = 'SELECT * FROM livros WHERE google_books_id = ?';
    const [bookResults] = await db.promise().query(bookSql, [googleBooksId]);

    if (bookResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
    }

    const book = bookResults[0];

    // Buscar a descrição do livro usando a Google Books API
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}`;
    const googleBooksResponse = await axios.get(googleBooksUrl);
    const volumeInfo = googleBooksResponse.data.volumeInfo;

    const bookDescription = volumeInfo.description || 'Descrição não disponível';
    const bookCategories = volumeInfo.categories || ['Desconhecido'];
    const bookPublisher = volumeInfo.publisher || 'Desconhecido';
    const bookPublishedDate = volumeInfo.publishedDate || 'Desconhecido';

    const imagesSql = 'SELECT imagem_url FROM livro_imagens WHERE livro_id = ?';
    const [imageResults] = await db.promise().query(imagesSql, [book.id]);

    const images = imageResults.map(row => row.imagem_url);

    res.status(200).json({
      success: true,
      book: {
        id: book.id,
        title: book.titulo,
        author: book.autor,
        description: bookDescription,
        categories: bookCategories,
        publisher: bookPublisher,
        publishedDate: bookPublishedDate,
        coverImage: book.imagem,
        images: images
      }
    });
  } catch (err) {
    console.error('Erro ao carregar os detalhes do livro:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar os detalhes do livro.' });
  }
});
// Rota para buscar livros
app.get('/search-books', async (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ success: false, message: 'Query de busca não fornecida.' });
  }

  try {
    const searchSql = `
      SELECT id, titulo, autor, imagem AS imageUrl, google_books_id AS googleBooksId, user_id AS userId
      FROM livros
      WHERE (titulo LIKE ? OR autor LIKE ?) AND status = "Disponível"
    `;
    const [results] = await db.promise().query(searchSql, [`%${searchQuery}%`, `%${searchQuery}%`]);

    res.json({ success: true, books: results });
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar livros.' });
  }
});

//Rota para o historico
app.get('/historico', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'historicoDeTroca.html'));
});

//Rota para o historico
app.get('/historico', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'historicoDeTroca.html'));
});

//Rota para obter as trocas
app.get('/api/user-exchanges', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const sql = `
    SELECT t.*, u.name AS usuario_solicitante, ur.name AS usuario_recebedor, 
           l_solicitante.titulo AS titulo_solicitante, l_recebedor.titulo AS titulo_recebedor
    FROM trocas t
    JOIN users u ON t.usuario_solicitante_id = u.id
    JOIN users ur ON t.usuario_recebedor_id = ur.id
    JOIN livros l_solicitante ON t.livro_solicitante_id = l_solicitante.id
    JOIN livros l_recebedor ON t.livro_recebedor_id = l_recebedor.id
    WHERE t.usuario_solicitante_id = ? OR t.usuario_recebedor_id = ?
  `;

  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar trocas do usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar trocas do usuário.' });
    }

    res.json({ success: true, exchanges: results });
  });
});

// Rota para enviar o arquivo admin.html
app.get('/admin', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Rota API para fornecer dados do administrador
app.get('/api/admin-data', isAuthenticated, (req, res) => {
  const adminId = req.session.userId; // Certifique-se de que o ID do administrador está na sessão

  if (!adminId) {
    return res.status(401).json({ success: false, message: 'Administrador não autenticado.' });
  }

  // Consulta SQL para buscar os dados do administrador
  const sql = 'SELECT name, email, state, city, phone, biography FROM admins WHERE id = ?';
  db.query(sql, [adminId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar dados do administrador:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
    }

    const admin = results[0];

    // Enviar os dados do administrador como resposta JSON
    res.json({
      success: true,
      adminName: admin.name,
      adminEmail: admin.email,
      adminState: admin.state,
      adminCity: admin.city,
      adminPhone: admin.phone,
      adminBiography: admin.biography
    });
  });
});

// Rota para a tela de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'inscricao-buku.html'));
});

// Função para enviar o código de verificação por e-mail
const enviarCodigoVerificacao = (email, codigo) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'buku.livro@gmail.com',
      pass: 'sdmj lybh fcrf nqyd'
    }
  });

  const mailOptions = {
    from: '"Buku 📚" <buku.livro@gmail.com>',
    to: email,
    subject: 'Código de Verificação',
    text: `Seu código de verificação é: ${codigo}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar o e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
};

// Rota para verificar o código de verificação
app.post('/verificar-codigo', isAuthenticated, (req, res) => {
  const { codigo } = req.body;
  const { codigoVerificacao, tentativas, bloqueadoAte } = req.session;

  if (bloqueadoAte && new Date() < new Date(bloqueadoAte)) {
    return res.status(403).json({
      success: false,
      message: 'Login bloqueado. Tente novamente mais tarde.'
    });
  }

  if (codigo === codigoVerificacao) {
    req.session.codigoVerificacao = null;
    req.session.tentativas = 0;
    req.session.bloqueadoAte = null;
    req.session.verificado = true; // Atualizar flag de verificação
    return res.status(200).json({
      success: true,
      message: 'Código verificado com sucesso.'
    });
  } else {
    req.session.tentativas += 1;
    if (req.session.tentativas >= 3) {
      req.session.bloqueadoAte = new Date(Date.now() + 60 * 60 * 1000); // Bloquear por 1 hora
      return res.status(403).json({
        success: false,
        message: 'Muitas tentativas falhas. Login bloqueado por 1 hora.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Código incorreto. Tente novamente.'
    });
  }
});

// Middleware para verificar se o usuário está autenticado e verificado
const isAuthenticatedAndVerified = (req, res, next) => {
  if (req.session.userId && req.session.verificado) {
    next();
  } else if (req.session.userId && !req.session.verificado) {
    res.redirect('/admin'); // Redireciona para a página de verificação de código
  } else {
    res.redirect('/login'); // Redireciona para login se não estiver autenticado
  }
};

// Rota para enviar o arquivo adminVerify.html
app.get('/adminVerify', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'adminVerify.html'));
});

// Rota para enviar o arquivo admin.html
app.get('/admin', isAuthenticatedAndVerified, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Rota para enviar o arquivo adminAlert.html
app.get('/alert', isAuthenticatedAndVerified, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'adminAlert.html'));
});

// Rota para enviar o arquivo admin_relatorio.html
app.get('/relatorio', isAuthenticatedAndVerified, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin_relatorio.html'));
});

// Rota para enviar o arquivo admin_gerenciar_usuarios.html
app.get('/manage-users', isAuthenticatedAndVerified, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin_gerenciar_usuarios.html'));
});


// Rota para obter informações dos usuários e seus livros
app.get('/api/users', isAuthenticatedAndVerified, async (req, res) => {
  const searchQuery = req.query.search || '';
  const sql = `
    SELECT u.id, u.name, u.email, u.state, u.city, u.phone, u.biography, u.status, l.id AS book_id, l.titulo, l.autor, l.imagem, l.status AS book_status
    FROM users u
    LEFT JOIN livros l ON u.id = l.user_id
    WHERE u.name LIKE ? OR u.email LIKE ?
  `;
  db.query(sql, [`%${searchQuery}%`, `%${searchQuery}%`], async (err, results) => {
    if (err) {
      console.error('Erro ao buscar informações dos usuários:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    // Obter o nome da cidade usando o código da cidade e do estado
    for (const user of results) {
      user.city = await getCityNameById(user.state, user.city);
    }

    res.json({ success: true, users: results });
  });
});

// Função para enviar o e-mail de alerta
const enviarEmailAlerta = (email, message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'buku.livro@gmail.com',
      pass: 'sdmj lybh fcrf nqyd'
    }
  });

  const mailOptions = {
    from: '"Buku 📚" <buku.livro@gmail.com>',
    to: email,
    subject: 'Alerta de Conta',
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar o e-mail:', error);
    } else {
      console.log('E-mail enviado:', info.response);
    }
  });
};

// Rota para enviar o alerta e aplicar a punição
app.post('/send-alert', isAuthenticatedAndVerified, (req, res) => {
  const { email, message, punishment } = req.body;

  // Verificar se o e-mail do usuário existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Email não encontrado.' });
    }

    const user = results[0];
    let status = 'ativo';
    let expiryDate = null;

    if (punishment === '3dias') {
      status = 'suspenso';
      expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias
    } else if (punishment === '5dias') {
      status = 'suspenso';
      expiryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 dias
    } else if (punishment === 'banimento') {
      status = 'banido';
    }

    // Atualizar o status do usuário no banco de dados
    db.query('UPDATE users SET status = ?, suspension_expiry = ? WHERE email = ?', [status, expiryDate, email], (err, results) => {
      if (err) {
        console.error('Erro ao atualizar status do usuário:', err);
        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
      }

      // Enviar e-mail de alerta
      enviarEmailAlerta(email, message);

      res.json({ success: true, message: 'Alerta enviado e punição aplicada com sucesso.' });
    });
  });
});

// Middleware para verificar se o usuário está suspenso ou banido
const checkSuspensionAndBan = (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect('/login');
  }

  db.query('SELECT status, suspension_expiry FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar status do usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.redirect('/login');
    }

    const user = results[0];
    const now = new Date();

    if (user.status === 'banido') {
      return res.status(403).json({
        success: false,
        message: 'Sua conta foi banida permanentemente. Caso tenha dúvidas, entre em contato pelo email buku.livro@gmail.com.'
      });
    }

    if (user.status === 'suspenso' && user.suspension_expiry && new Date(user.suspension_expiry) > now) {
      return res.status(403).json({
        success: false,
        message: `Sua conta está suspensa até ${user.suspension_expiry}. Caso tenha dúvidas, entre em contato pelo email buku.livro@gmail.com.`
      });
    }

    if (user.status === 'suspenso' && user.suspension_expiry && new Date(user.suspension_expiry) <= now) {
      // Se a suspensão expirou, atualizar o status para ativo
      db.query('UPDATE users SET status = "ativo", suspension_expiry = NULL WHERE id = ?', [userId], (err) => {
        if (err) {
          console.error('Erro ao atualizar status do usuário:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }
        next();
      });
    } else {
      next();
    }
  })};

    // Rota para obter os dados do relatório
    app.get('/api/relatorio', isAuthenticatedAndVerified, async (req, res) => {
      try {
        const totalUsuarios = await db.promise().query('SELECT COUNT(*) AS total FROM users');
        const totalLivros = await db.promise().query('SELECT COUNT(*) AS total FROM livros');
        const totalTrocas = await db.promise().query('SELECT COUNT(*) AS total FROM trocas');
        const usuariosMes = await db.promise().query('SELECT COUNT(*) AS total FROM users WHERE MONTH(data_cadastro) = MONTH(CURRENT_DATE()) AND YEAR(data_cadastro) = YEAR(CURRENT_DATE())');
        const livrosMes = await db.promise().query('SELECT COUNT(*) AS total FROM livros WHERE MONTH(data_adicao) = MONTH(CURRENT_DATE()) AND YEAR(data_adicao) = YEAR(CURRENT_DATE())');
        const trocasMes = await db.promise().query('SELECT COUNT(*) AS total FROM trocas WHERE MONTH(data_solicitacao) = MONTH(CURRENT_DATE()) AND YEAR(data_solicitacao) = YEAR(CURRENT_DATE())');
        const suspensoesMes = await db.promise().query('SELECT COUNT(*) AS total FROM users WHERE status = "suspenso" AND MONTH(suspension_expiry) = MONTH(CURRENT_DATE()) AND YEAR(suspension_expiry) = YEAR(CURRENT_DATE())');
        const banimentosMes = await db.promise().query('SELECT COUNT(*) AS total FROM users WHERE status = "banido" AND MONTH(data_banimento) = MONTH(CURRENT_DATE()) AND YEAR(data_banimento) = YEAR(CURRENT_DATE())');
        const usuariosMaisTrocas = await db.promise().query('SELECT u.id, u.name, COUNT(t.id) AS total_trocas FROM users u JOIN trocas t ON u.id = t.usuario_solicitante_id OR u.id = t.usuario_recebedor_id GROUP BY u.id ORDER BY total_trocas DESC LIMIT 5');
        const livrosMaisCadastrados = await db.promise().query('SELECT titulo, autor, imagem, COUNT(*) AS total FROM livros GROUP BY titulo, autor, imagem ORDER BY total DESC LIMIT 5');
        const livroMaisTrocado = await db.promise().query('SELECT l.titulo, l.autor, l.imagem, COUNT(t.id) AS total_trocas FROM livros l JOIN trocas t ON l.id = t.livro_solicitante_id OR l.id = t.livro_recebedor_id GROUP BY l.titulo, l.autor, l.imagem ORDER BY total_trocas DESC LIMIT 1');
    
        res.json({
          success: true,
          totalUsuarios: totalUsuarios[0][0].total,
          totalLivros: totalLivros[0][0].total,
          totalTrocas: totalTrocas[0][0].total,
          usuariosMes: usuariosMes[0][0].total,
          livrosMes: livrosMes[0][0].total,
          trocasMes: trocasMes[0][0].total,
          suspensoesMes: suspensoesMes[0][0].total,
          banimentosMes: banimentosMes[0][0].total,
          usuariosMaisTrocas: usuariosMaisTrocas[0],
          livrosMaisCadastrados: livrosMaisCadastrados[0],
          livroMaisTrocado: livroMaisTrocado[0]
        });
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
      }
    });