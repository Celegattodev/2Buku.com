document.addEventListener('DOMContentLoaded', function () {
    // Função para exibir detalhes do livro
    function viewBookDetails(googleBooksId) {
        if (!googleBooksId) {
            Swal.fire('Erro!', 'ID do livro não encontrado.', 'error');
            return;
        }

        fetch(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    const volumeInfo = data.volumeInfo || {};
                    const book = {
                        coverImage: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '/img/default-book-image.jpg',
                        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
                        publisher: volumeInfo.publisher || 'Desconhecido',
                        publishedDate: volumeInfo.publishedDate || 'Desconhecido',
                        description: volumeInfo.description || 'Descrição não disponível'
                    };

                    document.getElementById('bookCoverImage').src = book.coverImage;
                    document.getElementById('bookAuthor').textContent = book.author;
                    document.getElementById('bookPublisher').textContent = book.publisher;
                    document.getElementById('bookPublishedDate').textContent = book.publishedDate;
                    document.getElementById('bookDescription').textContent = book.description;

                    const bookDetailsModal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
                    bookDetailsModal.show();
                } else {
                    Swal.fire('Erro!', 'Erro ao carregar os detalhes do livro.', 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao carregar os detalhes do livro:', error);
                Swal.fire('Erro!', 'Erro ao carregar os detalhes do livro.', 'error');
            });
    }

    // Adicionar evento de clique para os botões "Ver Detalhes"
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('view-details')) {
            const googleBooksId = event.target.getAttribute('data-google-books-id');
            if (googleBooksId) {
                viewBookDetails(googleBooksId);
            } else {
                Swal.fire('Erro!', 'ID do livro não encontrado.', 'error');
            }
        }
    });

    // Adicionar evento de clique para os ícones de deletar na seção de favoritos
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-favorite')) {
            const bookId = event.target.getAttribute('data-book-id');
            Swal.fire({
                title: 'Tem certeza?',
                text: 'Você não poderá reverter isso!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, deletar!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    const bookElement = event.target.closest('.favorite-item');
                    deleteFavorite(bookId, bookElement);
                }
            });
        }
    });

    function deleteFavorite(bookId, bookElement) {
        fetch(`/remove-favorite/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (bookElement) {
                        bookElement.remove();
                    }
                    Swal.fire(
                        'Deletado!',
                        'Seu livro desejado foi deletado.',
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Erro!',
                        data.message || 'Erro ao deletar o livro desejado.',
                        'error'
                    );
                }
            })
            .catch(error => {
                console.error('Erro ao deletar o livro desejado:', error);
                Swal.fire(
                    'Erro!',
                    'Erro ao deletar o livro desejado.',
                    'error'
                );
            });
    }

    // Carregar livros favoritos
    fetch('/api/user-favorites')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const favoritesList = document.getElementById('favorites-list');
                data.favorites.forEach(favorite => {
                    const googleBooksId = favorite.google_books_id;
                    fetch(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`)
                        .then(response => response.json())
                        .then(bookData => {
                            if (bookData) {
                                const volumeInfo = bookData.volumeInfo || {};
                                const book = {
                                    coverImage: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '/img/default-book-image.jpg',
                                    title: volumeInfo.title || 'Título não disponível',
                                    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconhecido',
                                    publisher: volumeInfo.publisher || 'Desconhecido',
                                    publishedDate: volumeInfo.publishedDate || 'Desconhecido',
                                    description: volumeInfo.description || 'Descrição não disponível'
                                };

                                const favoriteCard = document.createElement('div');
                                favoriteCard.classList.add('favorite-item');
                                favoriteCard.innerHTML = `
                                    <div class="card h-100">
                                        <img src="${book.coverImage}" class="card-img-top" alt="${book.title}">
                                        <div class="card-body">
                                            <h5 class="card-title">${book.title}</h5>
                                            <p class="card-text">por <strong>${book.author}</strong></p>
                                            <button class="btn btn-primary btn-sm view-details" data-google-books-id="${googleBooksId}">Ver Detalhes</button>
                                            <button class="btn btn-danger btn-sm delete-favorite" data-book-id="${favorite.id}">Remover</button>
                                        </div>
                                    </div>
                                `;
                                favoritesList.appendChild(favoriteCard);
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao carregar os detalhes do livro:', error);
                        });
                });
            } else {
                Swal.fire('Erro!', 'Erro ao carregar os livros favoritos.', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os livros favoritos:', error);
            Swal.fire('Erro!', 'Erro ao carregar os livros favoritos.', 'error');
        });
});