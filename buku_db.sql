CREATE DATABASE IF NOT EXISTS `buku_db`;
USE `buku_db`;

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `imagem` varchar(255) NOT NULL,
  `google_books_id` varchar(255) NOT NULL
); 

CREATE TABLE `livros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `google_books_id` varchar(255) DEFAULT NULL,
  `data_adicao` datetime DEFAULT current_timestamp()
) 
  
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
  `token_expiry` datetime DEFAULT NULL
); 

ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `livros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);


ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

ALTER TABLE `livros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `livros`
  ADD CONSTRAINT `livros_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

CREATE TABLE `livro_imagens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `livro_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `imagem_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `livro_id` (`livro_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `livro_imagens_ibfk_1` FOREIGN KEY (`livro_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE,
  CONSTRAINT `livro_imagens_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);


CREATE TABLE `trocas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_solicitante_id` int(11) NOT NULL,
  `usuario_recebedor_id` int(11) NOT NULL,
  `livro_solicitante_id` int(11) NOT NULL,
  `livro_recebedor_google_books_id` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pendente',
  `data_solicitacao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_solicitante_id` (`usuario_solicitante_id`),
  KEY `usuario_recebedor_id` (`usuario_recebedor_id`),
  KEY `livro_solicitante_id` (`livro_solicitante_id`),
  CONSTRAINT `trocas_ibfk_1` FOREIGN KEY (`usuario_solicitante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trocas_ibfk_2` FOREIGN KEY (`usuario_recebedor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trocas_ibfk_3` FOREIGN KEY (`livro_solicitante_id`) REFERENCES `livros` (`id`) ON DELETE CASCADE
);