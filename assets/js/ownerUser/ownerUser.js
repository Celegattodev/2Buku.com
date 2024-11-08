document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (userId) {
        fetch(`/api/ownerUser/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Preencher informações do usuário
                    document.getElementById('profile-img').src = data.user.profileImage || '/img/default-profile.png';
                    document.getElementById('user-name').textContent = data.user.name;
                    document.getElementById('user-state').textContent = data.user.state;
                    document.getElementById('user-description').textContent = data.user.description;

                    // Carregar livros do usuário
                    const userBooksContainer = document.getElementById('user-books');
                    data.books.forEach(book => {
                        const bookCard = createBookCard(book, false);
                        userBooksContainer.appendChild(bookCard);
                    });

                    // Carregar livros favoritos do usuário
                    const userFavoritesContainer = document.getElementById('user-favorites');
                    data.favorites.forEach(book => {
                        const bookCard = createBookCard(book, true);
                        userFavoritesContainer.appendChild(bookCard);
                    });

                    // Adicionar funcionalidade de navegação
                    addCarouselNavigation();
                } else {
                    Swal.fire('Erro', data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar detalhes do usuário:', error);
                Swal.fire('Erro', 'Erro ao buscar detalhes do usuário. Por favor, tente novamente.', 'error');
            });
    } else {
        Swal.fire('Erro', 'ID do usuário não fornecido.', 'error');
    }
});

function createBookCard(book, isFavorite) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image';

    const image = document.createElement('img');
    image.className = 'product-thumb';
    image.src = book.imageUrl || '/img/default-book-image.jpg';
    image.alt = book.title;

    imageContainer.appendChild(image);

    const info = document.createElement('div');
    info.className = 'product-info';

    const title = document.createElement('h5');
    title.className = 'product-title';
    title.textContent = book.title;

    const author = document.createElement('p');
    author.className = 'product-author';
    author.textContent = book.author;

    info.appendChild(title);
    info.appendChild(author);

    // Adicionar os botões abaixo dos gêneros
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const addToFavoritesButton = document.createElement('button');
    addToFavoritesButton.classList.add('btn', 'btn-primary', 'btn-sm');
    addToFavoritesButton.textContent = 'Adicionar aos Favoritos ♥';
    addToFavoritesButton.addEventListener('click', (event) => {
        event.stopPropagation();
        addToFavorites(book);
    });

    buttonContainer.appendChild(addToFavoritesButton);

    if (!isFavorite) {
        const requestExchangeButton = document.createElement('button');
        requestExchangeButton.classList.add('btn', 'btn-success', 'btn-sm');
        requestExchangeButton.textContent = 'Solicitar Troca';
        requestExchangeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            requestExchange(book);
        });
        buttonContainer.appendChild(requestExchangeButton);
    }

    info.appendChild(buttonContainer);

    card.appendChild(imageContainer);
    card.appendChild(info);

    return card;
}

function addCarouselNavigation() {
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(carousel => {
        const preBtn = carousel.querySelector('.pre-btn');
        const nxtBtn = carousel.querySelector('.nxt-btn');
        const container = carousel.querySelector('.product-container');

        preBtn.addEventListener('click', () => {
            container.scrollLeft -= container.offsetWidth;
        });

        nxtBtn.addEventListener('click', () => {
            container.scrollLeft += container.offsetWidth;
        });
    });
}

function addToFavorites(book) {
    fetch('/add-favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            googleBooksId: book.googleBooksId,
            title: book.title,
            author: book.author,
            imageUrl: book.imageUrl
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Livro adicionado aos favoritos com sucesso!',
                });
            } else if (data.message === 'Livro já está nos favoritos') {
                Swal.fire({
                    icon: 'info',
                    title: 'Informação',
                    text: 'Este livro já está na sua lista de favoritos.',
                });
            } else if (data.message === 'Livro já está na biblioteca') {
                Swal.fire({
                    icon: 'info',
                    title: 'Informação',
                    text: 'Este livro já está na sua biblioteca.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro ao adicionar o livro aos favoritos.',
                });
            }
        })
        .catch(error => {
            console.error('Erro ao adicionar o livro aos favoritos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao adicionar o livro aos favoritos.',
            });
        });
}

function requestExchange(book) {
    fetch('/api/user-books')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const userBooks = data.books;
                const userId = data.userId; // Supondo que o ID do usuário logado seja retornado na resposta

                // Verificar se o livro pertence ao usuário logado
                if (book.userId === userId) {
                    Swal.fire('Erro', 'Este livro pertence a você. Não é possível solicitar troca.', 'error');
                    return;
                }

                let bookOptions = '';
                userBooks.forEach(userBook => {
                    bookOptions += `
                        <div class="user-book-option" data-book-id="${userBook.id}">
                            <img src="${userBook.imageUrl || '/img/default-book-image.jpg'}" alt="${userBook.titulo}" class="user-book-image">
                            <div class="user-book-info">
                                <p class="user-book-title">${userBook.titulo}</p>
                                <p class="user-book-author">${userBook.autor}</p>
                            </div>
                        </div>
                    `;
                });

                Swal.fire({
                    title: 'Solicitar Troca',
                    html: `
                        <p>Selecione um livro da sua biblioteca para trocar:</p>
                        <div class="user-books-container">
                            ${bookOptions}
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Enviar Solicitação',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        const selectedBookElement = Swal.getPopup().querySelector('.user-book-option.selected');
                        if (!selectedBookElement) {
                            Swal.showValidationMessage('Por favor, selecione um livro para troca.');
                        }
                        return selectedBookElement ? selectedBookElement.getAttribute('data-book-id') : null;
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const selectedBookId = result.value;
                        const receivingUserId = book.userId; // ID do usuário detentor do livro
                        const googleBooksId = book.googleBooksId; // ID do livro no Google Books
                        console.log(`Livro Recebedor Google Books ID: ${googleBooksId}, Livro Solicitante ID: ${selectedBookId}, Usuário Recebedor ID: ${receivingUserId}`);
                        sendExchangeRequest(receivingUserId, googleBooksId, selectedBookId);
                    }
                });

                // Adicionar evento de clique para selecionar o livro
                document.querySelectorAll('.user-book-option').forEach(option => {
                    option.addEventListener('click', function () {
                        document.querySelectorAll('.user-book-option').forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                    });
                });
            } else {
                console.error('Erro ao carregar os livros do usuário:', data.message);
                Swal.fire('Erro', 'Erro ao carregar seus livros. Por favor, tente novamente.', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os livros do usuário:', error);
            Swal.fire('Erro', 'Erro ao carregar seus livros. Por favor, tente novamente.', 'error');
        });
}

function sendExchangeRequest(receivingUserId, googleBooksId, sendingBookId) {
    console.log(`Enviando solicitação de troca: Usuário Recebedor ID ${receivingUserId}, Livro Recebedor Google Books ID ${googleBooksId}, Livro Solicitante ID ${sendingBookId}`);

    // Mostrar alerta de carregamento
    Swal.fire({
        title: 'Enviando solicitação...',
        text: 'Por favor, aguarde enquanto enviamos sua solicitação de troca.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('/api/request-exchange', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            googleBooksId: googleBooksId,
            sendingBookId: sendingBookId
        })
    })
        .then(response => response.json())
        .then(data => {
            // Fechar alerta de carregamento
            Swal.close();

            if (data.success) {
                Swal.fire('Sucesso', 'Solicitação de troca enviada com sucesso!', 'success');
            } else {
                console.error('Erro ao enviar a solicitação de troca:', data.message);
                Swal.fire('Erro', data.message, 'error');
            }
        })
        .catch(error => {
            // Fechar alerta de carregamento
            Swal.close();

            console.error('Erro ao enviar a solicitação de troca:', error);
            Swal.fire('Erro', 'Erro ao enviar a solicitação de troca. Por favor, tente novamente.', 'error');
        });
}
fetch(`/ownerUser/${userId}`)
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos:', data); // Log para verificar os dados recebidos

        if (data.success) {
            // Log cada campo para confirmar que os dados existem
            console.log('User:', data.user);
            console.log('Books:', data.books);
            console.log('Favorites:', data.favorites);

            document.getElementById('profile-img').src = data.user.profileImage || '/img/profile-image/th.jpeg';
            document.getElementById('user-name').textContent = data.user.name;
            document.getElementById('user-email').textContent = data.user.email;
            document.getElementById('user-city').textContent = data.user.city;
            document.getElementById('user-state').textContent = data.user.state;
            document.getElementById('user-phone').textContent = data.user.phone;
            document.getElementById('user-description').textContent = data.user.biography;

            // Verifique os livros do usuário
            const userBooksContainer = document.getElementById('user-books');
            data.books.forEach(book => {
                const bookCard = createBookCard(book);
                userBooksContainer.appendChild(bookCard);
            });

            // Verifique os livros favoritos do usuário
            const userFavoritesContainer = document.getElementById('user-favorites');
            data.favorites.forEach(book => {
                const bookCard = createBookCard(book);
                userFavoritesContainer.appendChild(bookCard);
            });
        } else {
            Swal.fire('Erro', data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erro ao buscar detalhes do usuário:', error);
        Swal.fire('Erro', 'Erro ao buscar detalhes do usuário. Por favor, tente novamente.', 'error');
    });
