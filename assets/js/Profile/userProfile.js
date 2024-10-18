document.addEventListener('DOMContentLoaded', function () {
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
                } else {
                    showError('Erro ao deletar o livro.');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar o livro:', error);
                showError('Erro ao deletar o livro.');
            });
    }

    // Função para deletar um livro favorito
    function deleteFavorite(bookId, bookElement) {
        fetch(`/remove-favorite/${bookId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bookElement.remove();
                    Swal.fire('Deletado!', 'Seu livro favorito foi deletado.', 'success');
                } else {
                    showError('Erro ao deletar o livro favorito.');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar o livro favorito:', error);
                showError('Erro ao deletar o livro favorito.');
            });
    }

    // Função para adicionar um livro à biblioteca
    function addToLibrary(googleBooksId, title, author, imageUrl, bookImages) {
        const formData = new FormData();
        formData.append('googleBooksId', googleBooksId);
        formData.append('title', title);
        formData.append('author', author);
        formData.append('imageUrl', imageUrl);

        for (let i = 0; i < bookImages.length; i++) {
            formData.append('bookImages', bookImages[i]);
        }

        // Mostrar o modal de carregamento
        Swal.fire({
            title: 'Carregando...',
            text: 'Por favor, aguarde enquanto as imagens são carregadas.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch('/add-book', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Fechar o modal de carregamento
                if (data.success) {
                    Swal.fire('Sucesso!', 'Livro adicionado com sucesso!', 'success');
                } else {
                    showError(data.message || 'Erro ao adicionar o livro.');
                }
            })
            .catch(error => {
                Swal.close(); // Fechar o modal de carregamento
                console.error('Erro ao adicionar o livro:', error);
                showError('Erro ao adicionar o livro.');
            });
    }

    // Adicionar evento de clique para os ícones de deletar
    document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', function () {
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

    // Adicionar evento de clique para os ícones de deletar na seção de favoritos
    document.querySelectorAll('.delete-favorite-icon').forEach(icon => {
        icon.addEventListener('click', function () {
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
                                    throw new Error(response.statusText);
                                }
                                return response.json();
                            })
                            .catch(error => {
                                Swal.showValidationMessage(`Erro: ${error}`);
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

    // Adicionar evento de clique para exibir detalhes do livro
    document.querySelectorAll('.book-item').forEach(item => {
        item.addEventListener('click', function () {
            const bookId = this.getAttribute('data-book-id');
            fetch(`/book-details/${bookId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('bookDescription').innerText = data.book.description;
                        const bookImagesWrapper = document.getElementById('bookImagesWrapper');
                        bookImagesWrapper.innerHTML = ''; // Limpa as imagens anteriores

                        // Adicionar a imagem de capa como o primeiro slide
                        const coverSlide = document.createElement('div');
                        coverSlide.classList.add('swiper-slide');
                        const coverImg = document.createElement('img');
                        coverImg.src = data.book.coverImage;
                        coverImg.classList.add('img-fluid');
                        coverSlide.appendChild(coverImg);
                        bookImagesWrapper.appendChild(coverSlide);

                        // Adicionar as imagens adicionais
                        data.book.images.forEach(imageUrl => {
                            const slide = document.createElement('div');
                            slide.classList.add('swiper-slide');
                            const img = document.createElement('img');
                            img.src = imageUrl;
                            img.classList.add('img-fluid');
                            slide.appendChild(img);
                            bookImagesWrapper.appendChild(slide);
                        });

                        var bookImagesSwiper = new Swiper('#bookImagesSwiper', {
                            slidesPerView: 1,
                            spaceBetween: 10,
                            navigation: {
                                nextEl: '.book-images-next',
                                prevEl: '.book-images-prev',
                            },
                            loop: true,
                            autoplay: {
                                delay: 5000, // Troca de imagem a cada 5 segundos
                                disableOnInteraction: false,
                            },
                            effect: 'fade',
                            fadeEffect: {
                                crossFade: true
                            }
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
    });
});