"use strict";

const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require('multer');
const axios = require("axios");

const app = express();
const saltRounds = 10; // Número de rounds para bcrypt

// Configuração do multer para armazenamento em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configura o motor de templates Handlebars
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Configura o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, "assets")));

// Configura o middleware para parsing de corpo das requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do middleware de sessão
app.use(
  session({
    secret: "your-secret-key", // Substitua por uma chave secreta segura
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

// Rota para a página inicial que renderiza inscricao-buku.hbs
app.get("/", (req, res) => {
  res.render("inscricao-buku", { title: "Inscrição Buku" });
});

// Rota para a página do perfil do usuário
app.get('/user-profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/'); // Redireciona para a página inicial se o usuário não estiver logado
  }

  db.query(
    'SELECT name, email, state, city, phone, biography, profile_image FROM users WHERE id = ?',
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
      const cityName = await getCityNameById(user.state, user.city);

      res.render('userProfile', {
        title: 'Perfil do Usuário',
        profileImageUrl: user.profile_image ? `data:image/jpeg;base64,${user.profile_image}` : '/img/profile-placeholder.png',
        userName: user.name,
        userEmail: user.email,
        userState: user.state,
        userCity: cityName,
        userPhone: user.phone,  
        userDescription: user.biography,
      });
    }
  );
});

// Rota para processar o login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email e senha são obrigatórios."
    });
  }

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("Erro ao verificar email:", err);
        return res.status(500).json({
          success: false,
          message: "Erro no servidor."
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Email não encontrado."
        });
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Erro na comparação da senha:", err);
          return res.status(500).json({
            success: false,
            message: "Erro no servidor."
          });
        }

        if (isMatch) {
          req.session.userId = user.id;
          return res.status(200).json({
            success: true,
            message: "Login realizado com sucesso!",
            redirect: "/user-profile"
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Senha incorreta."
          });
        }
      });
    });
  } catch (error) {
    console.error("Erro ao autenticar o usuário:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor."
    });
  }
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

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial."
    });
  }

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
        message: "Email já cadastrado!"
      });
    }

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Erro ao criptografar a senha:", err);
        return res.status(500).json({
          success: false,
          message: "Erro no servidor."
        });
      }

      db.query(
        "INSERT INTO users (name, email, state, city, password) VALUES (?, ?, ?, ?, ?)",
        [name, email, state, city, hashedPassword],
        (err) => {
          if (err) {
            console.error("Erro ao cadastrar usuário:", err);
            return res.status(500).json({
              success: false,
              message: "Erro ao registrar usuário."
            });
          }

          res.status(200).json({
            success: true,
            message: "Cadastro realizado com sucesso!"
          });
        }
      );
    });
  });
});

// Rota para a política de privacidade
app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy');
});

// Rota para a página de edição de perfil
app.get('/update-profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/'); // Redireciona se o usuário não estiver logado
  }

  db.query(
    'SELECT * FROM users WHERE id = ?',
    [req.session.userId],
    (err, results) => {
      if (err) {
        console.error('Erro ao buscar dados do usuário:', err);
        return res.status(500).send('Erro ao buscar dados do usuário.');
      }

      if (results.length === 0) {
        return res.status(404).send('Usuário não encontrado.');
      }

      const user = results[0];
      res.render('updateProfile', {
        title: 'Atualizar Perfil',
        userId: user.id,
        userName: user.name || '',
        userPhone: user.phone || '',
        userDescription: user.biography || '',
        profileImageUrl: user.profile_image || '/img/profile-placeholder.png'
      });
    }
  );
});

// Rota para processar a atualização do perfil
app.post('/update-profile', upload.single('profile_image'), (req, res) => {
  const { userId, name, phone, biography } = req.body;
  const profileImage = req.file ? req.file.buffer.toString('base64') : null;

  if (!userId || !name) {
    return res.status(400).json({
      success: false,
      message: 'Nome e ID do usuário são obrigatórios.'
    });
  }

  const updateValues = [name, phone, biography, profileImage, userId];

  db.query(
    `UPDATE users
     SET name = ?, phone = ?, biography = ?, profile_image = ?
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


// Rota para o logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao encerrar a sessão:", err);
      return res.status(500).send("Erro ao encerrar a sessão.");
    }
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
