-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 21/11/2024 às 11:39
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `buku_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `biography` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `state`, `city`, `password`, `phone`, `biography`) VALUES
(3, 'Guto', 'lugustavosocial@gmail.com', 'SP', 'São Paulo', '$2b$10$6NyxkMCPZFtOVThiP3liMuuKOxSeaG6BX2aGpX2v8h0t0qNqCUGB2', '1234567890', 'Administrador da plataforma Buku.');

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `imagem` varchar(255) NOT NULL,
  `google_books_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `favoritos`
--

INSERT INTO `favoritos` (`id`, `user_id`, `titulo`, `autor`, `imagem`, `google_books_id`) VALUES
(25, 34, 'O príncipe cruel (Vol. 1 O povo do ar)', 'Holly Black', 'https://books.google.com/books/content?id=MTtpDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'MTtpDwAAQBAJ'),
(26, 38, 'Bíblia sagrada Na jornada com Cristo', 'Daniel Faria, Maurício Zágari', 'http://books.google.com/books/publisher/content?id=cM6CDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE706z61aRAGFoXWFGTPnIljTfCXXUQlc9tvHXnZ86hDTvorlYPHnmwGiPBk70IXT1dlUX4bBbOsQDwl6P4d5Df_mtjGD1RFnyH68BKZ1pc8l_sgwS55K0dg57jNr4NydNtyn3wBE&s', 'cM6CDwAAQBAJ'),
(28, 34, 'O construtor de pontes', 'Markus Zusak', 'http://books.google.com/books/publisher/content?id=N9qEDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70o5Vi8JzLpEYjwdJBP60G17gm30vXpI1vVGsqjzzaNY2gutLhd85C_gI6DAN4JNRvYYtSWnKjaJdnXj3AtuGn8qDs-M81fo_aIoq6caMjfsOwC1WM-Whym7eHrpApDg13pSREf&s', 'N9qEDwAAQBAJ'),
(29, 39, 'Os outros da Bíblia', 'André Daniel Reinke', 'http://books.google.com/books/publisher/content?id=kEaMDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72Y8IziXWtB1lc3xDRZTNj5U1LKSk-WkQrtUdPa6_78otH6fyFdlONCqca4ELW1EP3d8u0Ikqv9busStmzUGpARvRSB-1f21WAWUmyS698ZTwj1EP8eN5HtkubzlnofBTjpkbxM&s', 'kEaMDwAAQBAJ'),
(30, 34, 'O azarão', 'Markus Zusak', 'http://books.google.com/books/publisher/content?id=ktY5DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72nN_mYsyLp5-29Qm9DWvHp5af3f1eX14ZWa_mbMokzXXNlING57cB8_CsDfwVFeJCL1-z7QZQofKt6Xilu9FevkusClFn9ECf-zy2KgFTe3ai13gKe9jCObQSj_OB52uvwm5nS&s', 'ktY5DwAAQBAJ'),
(31, 34, 'Os outros da Bíblia', 'André Daniel Reinke', 'https://books.google.com/books/content?id=kEaMDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'kEaMDwAAQBAJ'),
(32, 34, 'Conhecendo O Deus Da Bíblia', 'Matheus Gonçalves', 'https://books.google.com/books/content?id=AcV5DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'AcV5DwAAQBAJ'),
(34, 34, 'O planeta Neymar', 'Paulo Vinícius Coelho', 'http://books.google.com/books/publisher/content?id=LcSnBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73BaAgBUTBvSuvDvO-LdPG_tJNmZEpSlG6G6SbQM7SkWQqkbhiOQ0Qg1KGj7Gf734xB9l2Ihyca0lft_5gRL55N6L31FB2F5jC2rVaLCL3do4mwARraTZTrcXirsFz7BOTNLDmp&s', 'LcSnBAAAQBAJ'),
(35, 39, 'Celular - O Telefone Da Pessoa', 'Luiz Zico Rocha Soares', 'https://books.google.com/books/content?id=E2Kk6Y-a5tQC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'E2Kk6Y-a5tQC'),
(37, 34, 'Aedes de A a Z', 'Denise Valle, Raquel Aguiar, Denise Nacif Pimenta, Vinicius Ferreira', 'https://books.google.com/books/content?id=hKgjEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'hKgjEAAAQBAJ'),
(38, 34, 'Rio Book', 'Ricardo Amaral', 'https://books.google.com/books/content?id=KfYZDgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'KfYZDgAAQBAJ'),
(40, 34, 'Introdução à Web Semântica', 'Diego Eis', 'https://books.google.com/books/content?id=bi02DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'bi02DwAAQBAJ'),
(42, 34, 'Celular', 'Stephen King', 'http://books.google.com/books/publisher/content?id=h85mDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70uMe6JF7M-ayhVSnLU6dJ1QDZROh61ZKB9YnvIvvEBBjp_6BswV2EGMwE9Wx4OV8t0IDi1vfeU9yYJnD4mg-H3kSxLltXQGn5iBAFf1lmb9CSNphT49bS43chh6y7c9Ofd4gmY&s', 'h85mDwAAQBAJ'),
(43, 34, 'Origem, confiabilidade e significado da Bíblia', 'Wayne Grudem, C. John Collins, Thomas R. Schreiner', 'https://books.google.com/books/content?id=NisXEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'NisXEAAAQBAJ'),
(44, 34, 'Lendo a Bíblia para a Vida', 'George H. Gunthrie', 'https://books.google.com/books/content?id=qe0gBwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'qe0gBwAAQBAJ');

-- --------------------------------------------------------

--
-- Estrutura para tabela `livros`
--

CREATE TABLE `livros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `google_books_id` varchar(255) DEFAULT NULL,
  `data_adicao` datetime DEFAULT current_timestamp(),
  `status` enum('Disponível','Trocado') DEFAULT 'Disponível'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `livros`
--

INSERT INTO `livros` (`id`, `titulo`, `autor`, `user_id`, `imagem`, `google_books_id`, `data_adicao`, `status`) VALUES
(68, 'Bíblia sagrada Na jornada com Cristo', 'Daniel Faria, Maurício Zágari', 34, 'https://books.google.com/books/content?id=cM6CDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'cM6CDwAAQBAJ', '2024-10-18 17:30:13', 'Trocado'),
(70, 'MCU: The Reign of Marvel Studios', 'Joanna Robinson, Dave Gonzales, Gavin Edwards', 34, 'https://books.google.com/books/content?id=CYqpEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'CYqpEAAAQBAJ', '2024-10-18 18:09:48', 'Disponível'),
(71, 'A garota que eu quero', 'Markus Zusak', 38, 'https://books.google.com/books/content?id=UifhJn4z6WYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'UifhJn4z6WYC', '2024-11-06 14:32:24', 'Disponível'),
(72, 'O construtor de pontes', 'Markus Zusak', 38, 'https://books.google.com/books/content?id=N9qEDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'N9qEDwAAQBAJ', '2024-11-06 14:32:35', 'Disponível'),
(86, 'O azarão', 'Markus Zusak', 39, 'https://books.google.com/books/content?id=ktY5DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'ktY5DwAAQBAJ', '2024-11-07 19:08:29', 'Trocado'),
(89, 'Celular', 'Stephen King', 39, 'https://books.google.com/books/content?id=h85mDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'h85mDwAAQBAJ', '2024-11-08 20:42:18', 'Disponível'),
(90, 'Tpm', 'undefined', 39, 'https://books.google.com/books/content?id=v2EEAAAAMBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'v2EEAAAAMBAJ', '2024-11-08 20:43:10', 'Disponível'),
(92, 'Bulletin of the Pan American Union', 'Pan American Union', 39, 'https://books.google.com/books/content?id=pZcCAAAAYAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'pZcCAAAAYAAJ', '2024-11-08 21:14:43', 'Disponível');

-- --------------------------------------------------------

--
-- Estrutura para tabela `livro_imagens`
--

CREATE TABLE `livro_imagens` (
  `id` int(11) NOT NULL,
  `livro_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `imagem_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `livro_imagens`
--

INSERT INTO `livro_imagens` (`id`, `livro_id`, `user_id`, `imagem_url`) VALUES
(31, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283415/tqu9lcwqjpoq1qn7tiux.jpg'),
(32, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283416/et5bozkaqzvpedpspcut.jpg'),
(33, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283417/sza3erjaxz6nkoaxe0ld.png'),
(34, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283418/k44iewqwhi3xuh3zqex5.png'),
(35, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283418/pi8i8en2v5e2esnfkxrb.png'),
(36, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283419/bg8pleuqtlk5jy1xuivx.png'),
(41, 70, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285791/xasgawvhkt5ox878l564.jpg'),
(42, 70, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285791/i65ppncqs0e6riu9ssls.jpg'),
(43, 70, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285792/ecxvzpikjoyvsyg1ljmk.png'),
(44, 70, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285793/rwwcxxrnaaarpc6kk8bk.png'),
(45, 70, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285794/mgx5b5zyhu5oyxykztqk.png'),
(46, 70, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285795/hikvwlfi2kazjteb49zw.png'),
(47, 71, 38, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730914344/szcilaanejgw0mwzyidx.jpg'),
(48, 71, 38, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730914345/o9qdhjp80o3gagmadf7l.jpg'),
(49, 71, 38, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730914346/mrw7orkopzlc7uqghkfz.jpg'),
(50, 72, 38, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730914356/hmz61hyxmnhn0nlerjxn.jpg'),
(51, 72, 38, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730914356/a2jfzqpbe4cftu1rzdf5.jpg'),
(52, 72, 38, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730914357/vdaozw9jcafqdv48mec2.jpg'),
(114, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017311/efkfa1qmxrun68qaeggy.png'),
(115, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017312/ji9fxoqnegkjp66bji19.png'),
(116, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017313/iymw62ruqcuwfhakrzeo.jpg'),
(117, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017314/xmxmlbr7xznidaekb7f7.jpg'),
(118, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017314/dyx7uy4i6cc0f0is0soi.jpg'),
(129, 89, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109340/jf8udtxibnwfrxceber0.png'),
(130, 89, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109340/k8ekzivpg7ioktihipau.png'),
(131, 89, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109341/mz232njozposotzf642r.jpg'),
(132, 89, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109342/joeadvr9cuxlpde9tpad.jpg'),
(133, 89, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109342/dedirvzce6uv7xyal9aa.jpg'),
(134, 90, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109392/v6wkbezufgc1kbcnpwii.png'),
(135, 90, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109393/nmy0ip2wbrbyfuffmts7.png'),
(136, 90, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109394/d1jhywd9itsx6ta8mixw.jpg'),
(137, 90, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109394/kbbkdobsuwxd8mdx9qdc.jpg'),
(138, 90, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731109396/ut1k8waz2ymlslruoosq.jpg'),
(143, 92, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731111285/x8lu0hjncfdljqko0vj0.png'),
(144, 92, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731111287/znlr25b99gezdsaztnd9.jpg'),
(145, 92, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731111288/k5yfo8g3j6m6r9zsz1q9.jpg'),
(146, 92, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731111288/feou0r6d3wnqqdmkhsxy.jpg');

-- --------------------------------------------------------

--
-- Estrutura para tabela `trocas`
--

CREATE TABLE `trocas` (
  `id` int(11) NOT NULL,
  `usuario_solicitante_id` int(11) NOT NULL,
  `usuario_recebedor_id` int(11) NOT NULL,
  `livro_solicitante_id` int(11) NOT NULL,
  `livro_recebedor_google_books_id` varchar(255) NOT NULL,
  `data_solicitacao` datetime DEFAULT current_timestamp(),
  `token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL,
  `livro_recebedor_id` int(11) NOT NULL,
  `status` enum('Pendente','Aceito','Recusado') DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `trocas`
--

INSERT INTO `trocas` (`id`, `usuario_solicitante_id`, `usuario_recebedor_id`, `livro_solicitante_id`, `livro_recebedor_google_books_id`, `data_solicitacao`, `token`, `token_expiry`, `livro_recebedor_id`, `status`) VALUES
(24, 34, 39, 68, '', '2024-11-08 20:52:30', '8279ffd59cda79540fc5cefc0ebef00cb4bf4909a9b6ae607ac5fbf5d112f536', '2024-11-10 20:52:30', 89, ''),
(28, 34, 39, 68, '', '2024-11-08 21:20:49', '4edc316b7305201700ed6d8c8f1c9ba9991f5baec00da373e921a79f612345a0', '2024-11-10 21:20:49', 93, ''),
(31, 34, 38, 68, '', '2024-11-20 19:18:53', 'f8a8fa760f870caa6f21dab577f1d5e462157c8d72746d118926de6137010b65', '2024-11-22 19:18:53', 72, 'Pendente'),
(32, 34, 39, 68, '', '2024-11-20 19:19:21', 'b9023485afecb58b01c786cf19b5cb49ac0e9f6ae8a6929cf9c72c2ed6b83a21', '2024-11-22 19:19:21', 86, 'Aceito');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `biography` text DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `status` enum('ativo','banido','suspenso') DEFAULT 'ativo',
  `suspension_expiry` datetime DEFAULT NULL,
  `data_cadastro` datetime DEFAULT current_timestamp(),
  `data_banimento` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `state`, `city`, `password`, `phone`, `biography`, `reset_token`, `token_expiry`, `photo`, `status`, `suspension_expiry`, `data_cadastro`, `data_banimento`) VALUES
(34, 'luis gustavo', 'teste@gmail.com', 'BA', '2933604', '$2b$10$RubSxuqcbshIDAwHQTBAd.EAC29LLfabSA8g2Svxd9Rzludy25g1a', '11981520081', 'meu perfil de testess', NULL, NULL, NULL, 'ativo', NULL, '2024-11-20 18:43:41', NULL),
(38, 'João Souza Silva', 'teste1@gmail.com', 'RJ', '3301157', '$2b$10$YyVqseC.4V/gxYf01Q8EdukeZNzmOBbBhrxvE.BTmRw43PyDVD4wW', NULL, NULL, NULL, NULL, NULL, 'ativo', NULL, '2024-11-20 18:43:41', NULL),
(39, 'luis gustavosdfsd', 'francaguto10@gmail.com', 'PE', '2601607', '$2b$10$yT2cvD5oi0ROWAlcUlQej.UaK9R/cKytKKXq.DBPuBR0RLG5j0dyC', '11987654321', 'ola', NULL, '2024-11-23 17:57:58', NULL, 'banido', NULL, '2024-11-20 18:43:41', '2024-11-20 19:55:39'),
(40, 'Gottfried Wilhelm Leibniz', 'lugustavoteste@gmail.com', 'PI', '2201101', '$2b$10$g25y8BXJ57HWFlqANA8v2OFXB0PDBjvmlY1mI.lmme85hzlE0xmXG', '11986450081', 'ola, seja bem vindo', NULL, NULL, NULL, 'suspenso', '2024-11-23 18:20:40', '2024-11-20 18:43:41', NULL),
(41, 'enzo', 'fernandesdenzo223@gmail.com', 'PR', '4101150', '$2b$10$cEE9R5PEzX2bdP2RywS4duFggJbn6yfxZZNpuGseEEF977uCJfnRq', NULL, NULL, NULL, NULL, NULL, 'ativo', NULL, '2024-11-20 18:43:41', NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `livros`
--
ALTER TABLE `livros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `livro_imagens`
--
ALTER TABLE `livro_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `livro_id` (`livro_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `trocas`
--
ALTER TABLE `trocas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_solicitante_id` (`usuario_solicitante_id`),
  ADD KEY `usuario_recebedor_id` (`usuario_recebedor_id`),
  ADD KEY `livro_solicitante_id` (`livro_solicitante_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de tabela `livros`
--
ALTER TABLE `livros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT de tabela `livro_imagens`
--
ALTER TABLE `livro_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=154;

--
-- AUTO_INCREMENT de tabela `trocas`
--
ALTER TABLE `trocas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `livros`
--
ALTER TABLE `livros`
  ADD CONSTRAINT `livros_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `livro_imagens`
--
ALTER TABLE `livro_imagens`
  ADD CONSTRAINT `livro_imagens_ibfk_1` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `livro_imagens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `trocas`
--
ALTER TABLE `trocas`
  ADD CONSTRAINT `trocas_ibfk_1` FOREIGN KEY (`usuario_solicitante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trocas_ibfk_2` FOREIGN KEY (`usuario_recebedor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trocas_ibfk_3` FOREIGN KEY (`livro_solicitante_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
