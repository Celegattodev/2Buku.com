exports.register = (req, res) => {
    const { name, email, password, state, city } = req.body;

    // Verifique se o email já está registrado
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.status(500).send('Erro no servidor.');
        }

        if (results.length > 0) {
            return res.status(400).send('Este email já está em uso.');
        }

        // Inserir o novo usuário no banco de dados
        db.query('INSERT INTO users SET ?', { name, email, password, state, city }, (error, results) => {
            if (error) {
                return res.status(500).send('Ocorreu um erro ao cadastrar a conta.');
            }

            // Resposta de sucesso
            return res.status(200).send('Cadastro realizado com sucesso!');
        });
    });
};
