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
        return res.status(500).json({ success: false, message: 'Erro ao verificar os favoritos' });
      }

      if (results.length > 0) {
        return res.status(409).json({ success: false, message: 'Livro já está nos favoritos' });
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
    const bookDescription = googleBooksResponse.data.volumeInfo.description || 'Descrição não disponível';

    const imagesSql = 'SELECT imagem_url FROM livro_imagens WHERE livro_id = ?';
    const [imageResults] = await db.promise().query(imagesSql, [bookId]);

    const images = imageResults.map(row => row.imagem_url);

    res.status(200).json({
      success: true,
      book: {
        description: bookDescription,
        coverImage: book.imagem,
        images: images
      }
    });
  } catch (err) {
    console.error('Erro ao carregar os detalhes do livro:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar os detalhes do livro.' });
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
  const { googleBooksId, title, author, imageUrl } = req.body;
  const userId = req.session.userId;

  // Verificar se o livro já está na biblioteca
  const checkLibrarySql = 'SELECT * FROM livros WHERE user_id = ? AND google_books_id = ?';
  db.query(checkLibrarySql, [userId, googleBooksId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar a biblioteca:', err);
      return res.status(500).json({ success: false, message: 'Erro ao verificar a biblioteca' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Livro já está na biblioteca' });
    }

    // Verificar se o livro já está nos favoritos
    const checkFavoriteSql = 'SELECT * FROM favoritos WHERE user_id = ? AND google_books_id = ?';
    db.query(checkFavoriteSql, [userId, googleBooksId], (err, results) => {
      if (err) {
        console.error('Erro ao verificar os favoritos:', err);
        return res.status(500).json({ success: false, message: 'Erro ao verificar os favoritos' });
      }

      if (results.length > 0) {
        return res.status(409).json({ success: false, message: 'Livro já está nos favoritos' });
      }

      // Adicionar o livro aos favoritos
      const addFavoriteSql = 'INSERT INTO favoritos (google_books_id, titulo, autor, imagem, user_id) VALUES (?, ?, ?, ?, ?)';
      db.query(addFavoriteSql, [googleBooksId, title, author, imageUrl, userId], (err, result) => {
        if (err) {
          console.error('Erro ao adicionar o livro aos favoritos:', err);
          return res.status(500).json({ success: false, message: 'Erro ao adicionar o livro aos favoritos' });
        }

        res.status(201).json({ success: true, message: 'Livro adicionado aos favoritos com sucesso' });
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
      console.error('Erro ao deletar livro dos favoritos:', err);
      return res.status(500).json({ success: false, message: 'Erro ao deletar livro dos favoritos.' });
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
    GROUP BY google_books_id, user_id
    ORDER BY count DESC
    LIMIT 10
  `;

  // Consulta para buscar os últimos livros adicionados, incluindo o user_id do proprietário
  const latestBooksSql = `
    SELECT google_books_id, user_id
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
            if (result) {
              return {
                googleBooksId: popularBooks[index].google_books_id,
                title: result.volumeInfo.title,
                author: result.volumeInfo.authors.join(', '),
                imageUrl: result.volumeInfo.imageLinks.thumbnail,
                genres: result.volumeInfo.categories,
                userId: popularBooks[index].user_id  // Inclua userId aqui
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
                genres: result.volumeInfo.categories,
                userId: latestBooks[index].user_id  // Inclua userId aqui
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


// Rota para obter os livros do usuário logado
app.get('/api/user-books', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  db.query('SELECT id, titulo, autor, imagem AS imageUrl, google_books_id FROM livros WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar livros do usuário:', err);
      return res.status(500).json({ success: false, message: 'Erro ao buscar livros do usuário.' });
    }

    if (results.length === 0) {
      console.log(`Nenhum livro encontrado para o usuário com ID ${userId}.`);
    } else {
      console.log(`Livros encontrados para o usuário com ID ${userId}:`, results);
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
app.get('/ownerUser', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ownerUser.html'));
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
             ur.email AS recebedor_email, ur.name AS recebedor_name, ur.phone AS recebedor_phone
      FROM trocas t
      JOIN users u ON t.usuario_solicitante_id = u.id
      JOIN users ur ON t.usuario_recebedor_id = ur.id
      WHERE t.token = ?
  `;

  try {
    const [results] = await db.promise().query(getExchangeDetailsSql, [token]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Troca não encontrada.' });
    }

    const exchangeDetails = results[0];

    if (action === 'accept') {
      // Atualizar o status da troca para "Aceita"
      const updateExchangeSql = 'UPDATE trocas SET status = "Aceita" WHERE id = ?';
      await db.promise().query(updateExchangeSql, [exchangeDetails.id]);

      // Enviar e-mail para o solicitante informando que a troca foi aceita
      const userName = exchangeDetails.solicitante_name;
      const otherUserName = exchangeDetails.recebedor_name;
      enviarEmailComTemplate(exchangeDetails.solicitante_email, 'Troca aceita', 'templateTrocaAceita', { userName, otherUserName });

      return res.status(200).json({ success: true, message: 'Troca aceita com sucesso.' });
    } else if (action === 'deny') {
      // Atualizar o status da troca para "Recusada"
      const updateExchangeSql = 'UPDATE trocas SET status = "Recusada" WHERE id = ?';
      await db.promise().query(updateExchangeSql, [exchangeDetails.id]);

      // Enviar e-mail para o solicitante informando que a troca foi negada
      const userName = exchangeDetails.solicitante_name;
      const otherUserName = exchangeDetails.recebedor_name;
      enviarEmailComTemplate(exchangeDetails.solicitante_email, 'Troca negada', 'templateTrocaNegada', { userName, otherUserName });

      return res.status(200).json({ success: true, message: 'Troca recusada com sucesso.' });
    } else {
      return res.status(400).json({ success: false, message: 'Ação inválida.' });
    }
  } catch (err) {
    console.error('Erro ao processar a ação da troca:', err);
    return res.status(500).json({ success: false, message: 'Erro ao processar a ação da troca.' });
  }
});
// Rota para remover trocas pendentes com tokens expirados
app.delete('/api/remove-expired-exchanges', async (req, res) => {
  const currentTime = new Date();

  const deleteExpiredExchangesSql = 'DELETE FROM trocas WHERE status = "Pendente" AND token_expiry < ?';
  try {
    await db.promise().query(deleteExpiredExchangesSql, [currentTime]);
    res.json({ success: true, message: 'Trocas expiradas removidas com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover trocas expiradas:', err);
    res.status(500).json({ success: false, message: 'Erro ao remover trocas expiradas.' });
  }
});

// Rota para buscar livros
app.get('/search-books', async (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ success: false, message: 'Query de busca é obrigatória' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: searchQuery,
        key: 'SUA_CHAVE_API_GOOGLE_BOOKS' // Substitua pela sua chave da API do Google Books
      }
    });

    const books = response.data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      return {
        titulo: volumeInfo.title,
        autor: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
        genero: volumeInfo.categories ? volumeInfo.categories.join(', ') : 'Gênero desconhecido'
      };
    });

    res.json({ success: true, books });
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar livros' });
  }
});

// Rota para obter os detalhes do perfil do usuário proprietário
app.get('/api/ownerUser/:userId', isAuthenticated, async (req, res) => {
    const userId = req.params.userId;

    try {
        const userSql = 'SELECT name, email, city, state, phone, biography AS description FROM users WHERE id = ?';
        const [userResults] = await db.promise().query(userSql, [userId]);

        if (userResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        const user = userResults[0];

        const booksSql = 'SELECT id, titulo AS title, autor AS author, imagem AS imageUrl FROM livros WHERE user_id = ?';
        const [booksResults] = await db.promise().query(booksSql, [userId]);

        const favoritesSql = 'SELECT id, titulo AS title, autor AS author, imagem AS imageUrl FROM favoritos WHERE user_id = ?';
        const [favoritesResults] = await db.promise().query(favoritesSql, [userId]);

        res.status(200).json({
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