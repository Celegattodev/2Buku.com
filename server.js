"use strict";

const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const axios = require("axios");

const app = express();
const saltRounds = 10; // Número de rounds para bcrypt

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
app.get("/user-profile", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  // Consultar o banco de dados para obter as informações do usuário
  db.query(
    "SELECT name, email, state, city FROM users WHERE id = ?",
    [req.session.userId],
    async (err, results) => {
      if (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        return res.status(500).send("Erro ao buscar dados do usuário.");
      }

      if (results.length === 0) {
        return res.status(404).send("Usuário não encontrado.");
      }

      const user = results[0];
      const cityName = await getCityNameById(user.state, user.city);

      res.render("userProfile", {
        title: "Perfil do Usuário",
        profileImageUrl: "/img/profile-placeholder.png", // Substitua se tiver uma URL específica
        userName: user.name,
        userEmail: user.email,
        userState: user.state,
        userCity: cityName, // Usar o nome da cidade
        userDescription:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit...", // Substitua com descrição real se tiver
      });
    }
  );
});

// Rota para processar o login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Verifica se o e-mail e a senha foram fornecidos
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email e senha são obrigatórios." });
  }

  try {
    // Verifica se o usuário existe
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("Erro ao verificar email:", err);
        return res
          .status(500)
          .json({ success: false, message: "Erro no servidor." });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Email não encontrado." });
      }

      const user = results[0];

      // Verifica a senha
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Erro na comparação da senha:", err);
          return res
            .status(500)
            .json({ success: false, message: "Erro no servidor." });
        }

        if (isMatch) {
          // Senha correta
          req.session.userId = user.id;
          res.json({ success: true });
        } else {
          // Senha incorreta
          res.status(401).json({ success: false, message: "Senha incorreta." });
        }
      });
    });
  } catch (error) {
    console.error("Erro ao autenticar o usuário:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// Rota para processar o registro
app.post("/register", (req, res) => {
  const { name, email, password, state, city } = req.body;

  if (!name || !email || !password || !state || !city) {
    return res
      .status(400)
      .json({ success: false, message: "Todos os campos são obrigatórios." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Erro ao verificar email:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erro no servidor." });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email já cadastrado!" });
    }

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Erro ao criptografar a senha:", err);
        return res
          .status(500)
          .json({ success: false, message: "Erro no servidor." });
      }

      db.query(
        "INSERT INTO users (name, email, state, city, password) VALUES (?, ?, ?, ?, ?)",
        [name, email, state, city, hashedPassword],
        (err) => {
          if (err) {
            console.error("Erro ao cadastrar usuário:", err);
            return res
              .status(500)
              .json({ success: false, message: "Erro ao registrar usuário." });
          }

          res
            .status(200)
            .json({
              success: true,
              message: "Cadastro realizado com sucesso!",
            });
        }
      );
    });
  });
});

// Rota para fazer logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao destruir a sessão:", err);
      return res.status(500).send("Erro ao fazer logout.");
    }

    // Redireciona para a página inicial após o logout
    res.redirect("/");
  });
});

// Configuração da porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
