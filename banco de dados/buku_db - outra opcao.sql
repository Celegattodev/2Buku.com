-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 07/11/2024 às 23:12
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

CREATE DATABASE buku_db;

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
(16, 34, 'Os Vingadores: Mundo de Vingadores', 'Jonathan Hickman', 'https://books.google.com/books/content?id=xPulDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', ''),
(20, 34, 'A menina que roubava livros', 'Markus Zusak', 'http://books.google.com/books/content?id=-_MMbijUmTEC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70-QuPRlw30AcVjAg-7YicrhHFjzw3fatftG6gWE0sauDVBRRXRnrLbeHr_v8-6X8thuSSyS-BC3FlVnOxUoCVLUIZbsiIvNbsAG8V8GFbGNt5Ra7vf9MC9bOHxxXxkOA6l0riV&source=gbs_', ''),
(22, 34, 'Harry Potter e a Câmara Secreta', 'J.K. Rowling', 'http://books.google.com/books/publisher/content?id=hjcQCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71M3l-ZhI-QsZKbOGXMtFIAIlV3byeZy22UKmQMb_lim5T6tTq2agZ12wrCMVVHxokBuhGHg5kPQfSutdgI-k7EDHbTkI4mMIjtdB7zvC5s8agIOewMeD7wy6oKj6PX8YfktxyA&s', ''),
(25, 34, 'O príncipe cruel (Vol. 1 O povo do ar)', 'Holly Black', 'https://books.google.com/books/content?id=MTtpDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'MTtpDwAAQBAJ'),
(26, 38, 'Bíblia sagrada Na jornada com Cristo', 'Daniel Faria, Maurício Zágari', 'http://books.google.com/books/publisher/content?id=cM6CDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE706z61aRAGFoXWFGTPnIljTfCXXUQlc9tvHXnZ86hDTvorlYPHnmwGiPBk70IXT1dlUX4bBbOsQDwl6P4d5Df_mtjGD1RFnyH68BKZ1pc8l_sgwS55K0dg57jNr4NydNtyn3wBE&s', 'cM6CDwAAQBAJ'),
(27, 34, 'A garota que eu quero', 'Markus Zusak', 'http://books.google.com/books/content?id=UifhJn4z6WYC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70U_VIvqFzw0-hF59sypCdIcfcCN-eQPVmHoseZ1tX88DI8nXWuws1rHd20utdq8l7-Z-iNnveWtx0luWuVdNQ1PSfSWteAjVnMRAOTyt3o7U8NNPCVCwHgMUU2rteaRvBaAQLs&source=gbs_', 'UifhJn4z6WYC'),
(28, 34, 'O construtor de pontes', 'Markus Zusak', 'http://books.google.com/books/publisher/content?id=N9qEDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE70o5Vi8JzLpEYjwdJBP60G17gm30vXpI1vVGsqjzzaNY2gutLhd85C_gI6DAN4JNRvYYtSWnKjaJdnXj3AtuGn8qDs-M81fo_aIoq6caMjfsOwC1WM-Whym7eHrpApDg13pSREf&s', 'N9qEDwAAQBAJ'),
(29, 39, 'Os outros da Bíblia', 'André Daniel Reinke', 'http://books.google.com/books/publisher/content?id=kEaMDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE72Y8IziXWtB1lc3xDRZTNj5U1LKSk-WkQrtUdPa6_78otH6fyFdlONCqca4ELW1EP3d8u0Ikqv9busStmzUGpARvRSB-1f21WAWUmyS698ZTwj1EP8eN5HtkubzlnofBTjpkbxM&s', 'kEaMDwAAQBAJ');

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
  `data_adicao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `livros`
--

INSERT INTO `livros` (`id`, `titulo`, `autor`, `user_id`, `imagem`, `google_books_id`, `data_adicao`) VALUES
(64, 'O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 34, 'https://books.google.com/books/content?id=_NTSEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', '_NTSEAAAQBAJ', '2024-10-18 17:11:20'),
(65, 'O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 34, 'https://books.google.com/books/content?id=VkHoDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'VkHoDwAAQBAJ', '2024-10-18 17:15:10'),
(67, 'Capitães da Areia', 'Jorge Amado', 34, 'https://books.google.com/books/content?id=FDJ1_r4MCIEC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'FDJ1_r4MCIEC', '2024-10-18 17:26:12'),
(68, 'Bíblia sagrada Na jornada com Cristo', 'Daniel Faria, Maurício Zágari', 34, 'https://books.google.com/books/content?id=cM6CDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'cM6CDwAAQBAJ', '2024-10-18 17:30:13'),
(69, 'O príncipe', 'Nicolau Maquiavel', 34, 'https://books.google.com/books/content?id=cKebDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'cKebDwAAQBAJ', '2024-10-18 18:02:34'),
(70, 'MCU: The Reign of Marvel Studios', 'Joanna Robinson, Dave Gonzales, Gavin Edwards', 34, 'https://books.google.com/books/content?id=CYqpEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'CYqpEAAAQBAJ', '2024-10-18 18:09:48'),
(71, 'A garota que eu quero', 'Markus Zusak', 38, 'https://books.google.com/books/content?id=UifhJn4z6WYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'UifhJn4z6WYC', '2024-11-06 14:32:24'),
(72, 'O construtor de pontes', 'Markus Zusak', 38, 'https://books.google.com/books/content?id=N9qEDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'N9qEDwAAQBAJ', '2024-11-06 14:32:35'),
(73, 'Uma história dos povos árabes', 'Albert Hourani', 34, 'https://books.google.com/books/content?id=pn4J_7pdoRAC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'pn4J_7pdoRAC', '2024-11-06 15:15:59'),
(76, 'O príncipe', 'Nicolau Maquiavel', 34, 'https://books.google.com/books/content?id=_PA1EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', '_PA1EAAAQBAJ', '2024-11-07 15:56:28'),
(86, 'O azarão', 'Markus Zusak', 39, 'https://books.google.com/books/content?id=ktY5DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'ktY5DwAAQBAJ', '2024-11-07 19:08:29');

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
(15, 64, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282283/tic1hkdxftcue3hvygm9.png'),
(16, 64, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282284/aio8fsleitjvsl66mlrq.png'),
(17, 64, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282284/ko5ehozppzllsnempcwi.png'),
(18, 64, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282285/lexuzjmtl1ahbd5hnl5d.png'),
(19, 65, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282513/tswubbl7tcykd3yoirmg.png'),
(20, 65, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282514/opuppanlfhgtwjmegcls.png'),
(21, 65, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282515/yzzdrx4gfec1b6uxsf1k.png'),
(22, 65, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729282516/k4uzoqpip9ji9fmqav93.png'),
(27, 67, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283175/vsiuys1tornrtrvvze9r.jpg'),
(28, 67, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283175/wnzffbz5dv5nqrgqhdfv.png'),
(29, 67, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283176/moz6nnbfxoesrvmfjtlb.png'),
(30, 67, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283177/m4kdyykfxg1nh4g5qqyf.png'),
(31, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283415/tqu9lcwqjpoq1qn7tiux.jpg'),
(32, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283416/et5bozkaqzvpedpspcut.jpg'),
(33, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283417/sza3erjaxz6nkoaxe0ld.png'),
(34, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283418/k44iewqwhi3xuh3zqex5.png'),
(35, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283418/pi8i8en2v5e2esnfkxrb.png'),
(36, 68, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729283419/bg8pleuqtlk5jy1xuivx.png'),
(37, 69, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285357/hxanwgkl3nh28otm0h4u.png'),
(38, 69, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285358/x8nstygpgk0bhy17cfcw.png'),
(39, 69, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285359/b7gpnmpuxny7hzfsonqt.png'),
(40, 69, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1729285359/qakhjat4x8bl03km9dfz.png'),
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
(53, 73, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730916960/ssym3fayawkuagktsyyy.jpg'),
(54, 73, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730916960/rc9zyrb1awlu1viks1yn.jpg'),
(55, 73, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1730916961/fkgq2dwkxbggme4ojgx0.jpg'),
(66, 76, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731005791/vz02hhfijzwg2ngjb9kv.png'),
(67, 76, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731005792/usbuxafdceorj8ikymoi.png'),
(68, 76, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731005793/jb8ud1r8cmyg0nec1uzw.jpg'),
(69, 76, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731005793/fmxr0ixugeuckqexocyn.jpg'),
(70, 76, 34, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731005794/qvoabgwxlt4jnorqf50i.jpg'),
(114, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017311/efkfa1qmxrun68qaeggy.png'),
(115, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017312/ji9fxoqnegkjp66bji19.png'),
(116, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017313/iymw62ruqcuwfhakrzeo.jpg'),
(117, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017314/xmxmlbr7xznidaekb7f7.jpg'),
(118, 86, 39, 'https://res.cloudinary.com/deyhmso1q/image/upload/v1731017314/dyx7uy4i6cc0f0is0soi.jpg');

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
  `photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `state`, `city`, `password`, `phone`, `biography`, `reset_token`, `token_expiry`, `photo`) VALUES
(34, 'luis gustavo', 'teste@gmail.com', 'BA', '2933604', '$2b$10$RubSxuqcbshIDAwHQTBAd.EAC29LLfabSA8g2Svxd9Rzludy25g1a', '11981520081', 'meu perfil de teste', NULL, NULL, NULL),
(38, 'João Souza Silva', 'teste1@gmail.com', 'RJ', '3301157', '$2b$10$YyVqseC.4V/gxYf01Q8EdukeZNzmOBbBhrxvE.BTmRw43PyDVD4wW', NULL, NULL, NULL, NULL, NULL),
(39, 'luis gustavosdfsd', 'francaguto10@gmail.com', 'PE', '2601607', '$2b$10$yT2cvD5oi0ROWAlcUlQej.UaK9R/cKytKKXq.DBPuBR0RLG5j0dyC', '11987654321', 'ola', NULL, NULL, NULL),
(40, 'Gottfried Wilhelm Leibniz', 'lugustavoteste@gmail.com', 'PI', '2201101', '$2b$10$g25y8BXJ57HWFlqANA8v2OFXB0PDBjvmlY1mI.lmme85hzlE0xmXG', '11986450081', 'ola, seja bem vindo', NULL, NULL, NULL);

--
-- Índices para tabelas despejadas
--

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
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de tabela `livros`
--
ALTER TABLE `livros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT de tabela `livro_imagens`
--
ALTER TABLE `livro_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT de tabela `trocas`
--
ALTER TABLE `trocas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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
