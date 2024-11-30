document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/relatorio')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('total-usuarios').textContent = data.totalUsuarios;
                document.getElementById('total-livros').textContent = data.totalLivros;
                document.getElementById('total-trocas').textContent = data.totalTrocas;
                document.getElementById('usuarios-mes').textContent = data.usuariosMes;
                document.getElementById('livros-mes').textContent = data.livrosMes;
                document.getElementById('trocas-mes').textContent = data.trocasMes;
                document.getElementById('suspensoes-mes').textContent = data.suspensoesMes;
                document.getElementById('banimentos-mes').textContent = data.banimentosMes;

                const usuariosMaisTrocasContainer = document.getElementById('usuarios-mais-trocas');
                data.usuariosMaisTrocas.forEach(usuario => {
                    const userCard = document.createElement('div');
                    userCard.classList.add('card', 'col-md-4', 'mb-4');
                    userCard.innerHTML = `
                        <div class="user-image">
                            <img src="/img/profile-image/th.jpeg" alt="Foto de Perfil">
                        </div>
                        <div class="user-desc">
                            <h4>${usuario.name}</h4>
                            <p>Total de Trocas: ${usuario.total_trocas}</p>
                        </div>
                    `;
                    usuariosMaisTrocasContainer.appendChild(userCard);
                });

                const livrosMaisCadastradosContainer = document.getElementById('livros-mais-cadastrados');
                data.livrosMaisCadastrados.forEach(livro => {
                    const bookCard = document.createElement('div');
                    bookCard.classList.add('card', 'col-md-4', 'mb-4');
                    bookCard.innerHTML = `
                        <div class="livro">
                            <img src="${livro.imagem}" alt="${livro.titulo}">
                        </div>
                        <div class="book-desc">
                            <h4>${livro.titulo}</h4>
                            <p>${livro.autor}</p>
                            <p>Total de Cadastros: ${livro.total}</p>
                        </div>
                    `;
                    livrosMaisCadastradosContainer.appendChild(bookCard);
                });
            } else {
                console.error('Erro ao obter dados do relatório:', data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao obter dados do relatório:', error);
        });
});