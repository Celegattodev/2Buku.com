document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const usersContainer = document.querySelector('.results .list-group');

    // Função para buscar e renderizar os usuários
    function fetchAndRenderUsers(query = '') {
        fetch(`/api/users?search=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    usersContainer.innerHTML = ''; // Limpar o conteúdo existente

                    // Agrupar os livros por usuário
                    const usersMap = new Map();
                    data.users.forEach(user => {
                        if (!usersMap.has(user.id)) {
                            usersMap.set(user.id, {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                state: user.state,
                                city: user.city,
                                phone: user.phone,
                                biography: user.biography,
                                status: user.status,
                                books: []
                            });
                        }
                        if (user.book_id) {
                            usersMap.get(user.id).books.push({
                                id: user.book_id,
                                titulo: user.titulo,
                                autor: user.autor,
                                imagem: user.imagem,
                                status: user.book_status
                            });
                        }
                    });

                    // Renderizar as informações dos usuários
                    usersMap.forEach(user => {
                        const userItem = document.createElement('li');
                        userItem.classList.add('list-group-item');
                        userItem.id = 'item-history';
                        userItem.innerHTML = `
                            <div class="col mt-2 mb-2">
                                <h5><a href="/ownerUser?userId=${user.id}">${user.name}</a></h5>
                                <div class="desc mt-3">
                                    <p><strong>Email:</strong> ${user.email}</p>
                                    <p><strong>Status:</strong> ${user.status}</p>
                                    <p><strong>Telefone:</strong> ${user.phone}</p>
                                    <p><strong>Estado:</strong> ${user.state}</p>
                                    <p><strong>Cidade:</strong> ${user.city}</p>
                                    <p><strong>Biografia:</strong> ${user.biography}</p>
                                </div>
                                <h6>Livros cadastrados:</h6>
                                <div class="accordion" id="accordion-${user.id}">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="heading-${user.id}">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${user.id}" aria-expanded="false" aria-controls="collapse-${user.id}">
                                                Ver livros cadastrados
                                            </button>
                                        </h2>
                                        <div id="collapse-${user.id}" class="accordion-collapse collapse" aria-labelledby="heading-${user.id}" data-bs-parent="#accordion-${user.id}">
                                            <div class="accordion-body">
                                                ${user.books.map(book => `
                                                    <div class="book-item">
                                                        <img src="${book.imagem}" alt="${book.titulo}" class="book-image">
                                                        <div class="book-info">
                                                            <p><strong>Título:</strong> ${book.titulo}</p>
                                                            <p><strong>Autor:</strong> ${book.autor}</p>
                                                            <p><strong>Status:</strong> ${book.status}</p>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <a href="/user-history">
                                    <button type="button" class="btn" id="button-details">Ver histórico de trocas</button>
                                </a>
                                <a href="/alert">
                                    <button type="button" class="btn" id="button-alert">Alerta</button>
                                </a>
                                ${user.status === 'banido' ? `
                                    <button class="btn" id="button-db">Desbanir</button>
                                ` : ''}
                            </div>
                        `;
                        usersContainer.appendChild(userItem);
                    });
                } else {
                    console.error('Erro ao obter informações dos usuários:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao obter informações dos usuários:', error);
            });
    }

    // Buscar e renderizar os usuários ao carregar a página
    fetchAndRenderUsers();

    // Adicionar funcionalidade de busca
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        fetchAndRenderUsers(query);
    });
});