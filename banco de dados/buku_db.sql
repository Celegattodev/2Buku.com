
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


CREATE DATABASE buku_db;

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `imagem` varchar(255) NOT NULL,
  `google_books_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `livros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `google_books_id` varchar(255) DEFAULT NULL,
  `data_adicao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `livro_imagens` (
  `id` int(11) NOT NULL,
  `livro_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `imagem_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


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


ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);


ALTER TABLE `livros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `livro_imagens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `livro_id` (`livro_id`),
  ADD KEY `user_id` (`user_id`);


ALTER TABLE `trocas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_solicitante_id` (`usuario_solicitante_id`),
  ADD KEY `usuario_recebedor_id` (`usuario_recebedor_id`),
  ADD KEY `livro_solicitante_id` (`livro_solicitante_id`);


ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);


ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;


ALTER TABLE `livros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;


ALTER TABLE `livro_imagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=154;


ALTER TABLE `trocas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;


ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;


ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


ALTER TABLE `livros`
  ADD CONSTRAINT `livros_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);


ALTER TABLE `livro_imagens`
  ADD CONSTRAINT `livro_imagens_ibfk_1` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `livro_imagens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


ALTER TABLE `trocas`
  ADD CONSTRAINT `trocas_ibfk_1` FOREIGN KEY (`usuario_solicitante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trocas_ibfk_2` FOREIGN KEY (`usuario_recebedor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trocas_ibfk_3` FOREIGN KEY (`livro_solicitante_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE;

ALTER TABLE `livros`
ADD COLUMN `status` ENUM('Disponível', 'Trocado') DEFAULT 'Disponível';

CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `state` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `biography` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `users`
MODIFY COLUMN `status` ENUM('ativo', 'banido', 'suspenso') DEFAULT 'ativo';

ALTER TABLE `users`
ADD COLUMN `suspension_expiry` datetime DEFAULT NULL;

ALTER TABLE `users`
ADD COLUMN `data_cadastro` DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `livros`
ADD COLUMN `data_adicao` DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE `users`
ADD COLUMN `data_banimento` DATETIME NULL;