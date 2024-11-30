document.addEventListener('DOMContentLoaded', function () {
    const swiperWrapper = document.querySelector('.swiper-wrapper'); // Mova esta linha para o início do bloco

    var meusLivrosSwiper = new Swiper('#meus-livros-swiper', {
        slidesPerView: 3,
        spaceBetween: 10,
        navigation: {
            nextEl: '.meus-livros-next',
            prevEl: '.meus-livros-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
        loop: false,
    });

    // Verificar se há livros na biblioteca
    const books = swiperWrapper.querySelectorAll('.book-item');
    const noBooksMessage = document.getElementById('no-books-message');
    if (books.length === 0) {
        noBooksMessage.style.display = 'block';
    } else {
        noBooksMessage.style.display = 'none';
    }

    // Função para exibir mensagens de erro
    function showError(message) {
        Swal.fire('Erro!', message, 'error');
    }

    // Função para deletar um livro
    function deleteBook(bookId, bookElement) {
        fetch(`/delete-book/${bookId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bookElement.remove();
                    Swal.fire('Deletado!', 'Seu livro foi deletado.', 'success');
                    // Verificar novamente se há livros na biblioteca
                    if (swiperWrapper.children.length === 0) {
                        noBooksMessage.style.display = 'block';
                    }
                } else {
                    showError('Erro ao deletar o livro.');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar o livro:', error);
                showError('Erro ao deletar o livro.');
            });
    }

    // Adicionar evento de clique para os ícones de deletar
    document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', function (event) {
            event.stopPropagation(); // Impede a propagação do evento de clique
            const bookId = this.closest('.book-item').getAttribute('data-book-id');
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
                    deleteBook(bookId, this.closest('.book-item'));
                }
            });
        });
    });
});


// Adicionar evento de clique para os ícones de deletar na seção de favoritos
document.querySelectorAll('.delete-favorite-icon').forEach(icon => {
    icon.addEventListener('click', function (event) {
        event.stopPropagation(); // Impede a propagação do evento de clique
        const bookId = this.closest('.favorite-item').getAttribute('data-book-id');
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
                deleteFavorite(bookId, this.closest('.favorite-item'));
            }
        });
    });
});

// Adicionar evento de clique para deletar a conta
document.getElementById('delete-account-button').addEventListener('click', function () {
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Este processo é irreversível. Deseja realmente deletar sua conta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, deletar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Digite sua senha',
                input: 'password',
                inputLabel: 'Senha',
                inputPlaceholder: 'Digite sua senha',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Deletar Conta',
                cancelButtonText: 'Cancelar',
                showLoaderOnConfirm: true,
                preConfirm: (password) => {
                    return fetch('/delete-account', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ password: password })
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Senha incorreta, tente novamente.');
                            }
                            return response.json();
                        })
                        .catch(error => {
                            Swal.showValidationMessage(`${error}`);
                        });
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    if (result.value.success) {
                        Swal.fire('Deletado!', 'Sua conta foi deletada com sucesso.', 'success').then(() => {
                            window.location.href = '/';
                        });
                    } else {
                        showError(result.value.message || 'Erro ao deletar a conta.');
                    }
                }
            });
        }
    });
});

// Função para exibir detalhes do livro
function showBookDetails(bookId) {
    fetch(`/api/book-details/${bookId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os detalhes do livro.');
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }

            const book = data.book;
            document.getElementById('bookDescription').innerText = book.description || 'Descrição não disponível';
            const bookImagesGrid = document.getElementById('bookImagesGrid');
            bookImagesGrid.innerHTML = ''; // Limpa as imagens anteriores

            // Adicionar a imagem de capa como o primeiro item
            const coverItem = document.createElement('div');
            coverItem.classList.add('image-item');
            const coverImg = document.createElement('img');
            coverImg.src = book.coverImage || 'placeholder.jpg'; // Use uma imagem padrão se não houver imagem
            coverImg.classList.add('img-fluid');
            const coverLabel = document.createElement('p');
            coverLabel.innerText = 'Imagem da Capa';
            coverItem.appendChild(coverImg);
            coverItem.appendChild(coverLabel);
            bookImagesGrid.appendChild(coverItem);

            // Adicionar as imagens adicionais
            if (book.images) {
                book.images.forEach((imageUrl, index) => {
                    const imageItem = document.createElement('div');
                    imageItem.classList.add('image-item');
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.classList.add('img-fluid');
                    const imgLabel = document.createElement('p');
                    imgLabel.innerText = `Imagem ${index + 1}`;
                    imageItem.appendChild(img);
                    imageItem.appendChild(imgLabel);
                    bookImagesGrid.appendChild(imageItem);
                });
            }

            // Exibir o modal
            var bookDetailsModal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
            bookDetailsModal.show();
        })
        .catch(error => {
            console.error('Erro ao carregar os detalhes do livro:', error);
            showError('Erro ao carregar os detalhes do livro.');
        });
}

// Adicionar evento de clique para exibir detalhes do livro
document.querySelectorAll('.book-item').forEach(item => {
    item.addEventListener('click', function () {
        const bookId = this.getAttribute('data-book-id');
        if (bookId) {
            showBookDetails(bookId);
        } else {
            showError('ID do livro não encontrado.');
        }
    });
});


// Adicionar evento de clique para adicionar um livro à biblioteca
document.getElementById('addBookButton').addEventListener('click', function () {
    const googleBooksId = document.getElementById('googleBooksId').value;
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const bookImages = document.getElementById('bookImages').files;

    if (googleBooksId && title && author && imageUrl && bookImages.length >= 3) {
        addToLibrary(googleBooksId, title, author, imageUrl, bookImages);
    } else {
        showError('Por favor, preencha todos os campos e anexe pelo menos 3 imagens.');
    }

    // Função para exibir detalhes do livro
    function viewBookDetails(bookId) {
        console.log(`Buscando detalhes do livro com ID: ${bookId}`);
        fetch(`/api/book-details/${bookId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    document.getElementById('bookDescription').innerText = data.book.description;
                    const bookImagesGrid = document.getElementById('bookImagesGrid');
                    bookImagesGrid.innerHTML = ''; // Limpa as imagens anteriores

                    // Adicionar a imagem de capa como o primeiro item
                    const coverItem = document.createElement('div');
                    coverItem.classList.add('image-item');
                    const coverImg = document.createElement('img');
                    coverImg.src = data.book.coverImage;
                    coverImg.classList.add('img-fluid');
                    const coverLabel = document.createElement('p');
                    coverLabel.innerText = 'Imagem da Capa';
                    coverItem.appendChild(coverImg);
                    coverItem.appendChild(coverLabel);
                    bookImagesGrid.appendChild(coverItem);

                    // Adicionar as imagens adicionais
                    data.book.images.forEach((imageUrl, index) => {
                        const imageItem = document.createElement('div');
                        imageItem.classList.add('image-item');
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.classList.add('img-fluid');
                        const imgLabel = document.createElement('p');
                        imgLabel.innerText = `Imagem ${index + 1}`;
                        imageItem.appendChild(img);
                        imageItem.appendChild(imgLabel);
                        bookImagesGrid.appendChild(imageItem);
                    });

                    // Exibir o modal
                    var bookDetailsModal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
                    bookDetailsModal.show();
                } else {
                    showError('Erro ao carregar os detalhes do livro.');
                }
            })
            .catch(error => {
                console.error('Erro ao carregar os detalhes do livro:', error);
                showError('Erro ao carregar os detalhes do livro.');
            });
    }

    // Adicionar evento de clique para exibir detalhes do livro
    document.querySelectorAll('.book-item').forEach(item => {
        item.addEventListener('click', function () {
            const bookId = this.getAttribute('data-book-id');
            viewBookDetails(bookId);
        });
    });
});


