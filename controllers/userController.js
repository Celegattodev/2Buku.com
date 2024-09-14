//UserProfile.hbs
exports.showProfile = (req, res) => {
    // Dados fictícios do usuário para exibir na página
    const userData = {
        name: "João Silva",
        email: "joao.silva@example.com",
        favoriteBooks: [
            { title: "1984", author: "George Orwell" },
            { title: "Dom Casmurro", author: "Machado de Assis" }
        ]
    };

    res.render('userProfile', { 
        title: 'Perfil do Usuário', 
        user: userData 
    });
};