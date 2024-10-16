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

    var livrosFavoritosSwiper = new Swiper('#livros-favoritos-swiper', {
        slidesPerView: 3,
        spaceBetween: 10,
        navigation: {
            nextEl: '.livros-favoritos-next',
            prevEl: '.livros-favoritos-prev',
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
                                Swal.showValidationMessage(
                                    `Erro: ${error}`
                                );
                            });
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (result.value.success) {
                            Swal.fire(
                                'Deletado!',
                                'Sua conta foi deletada com sucesso.',
                                'success'
                            ).then(() => {
                                window.location.href = '/';
                            });
                        } else {
                            Swal.fire(
                                'Erro!',
                                result.value.message || 'Erro ao deletar a conta.',
                                'error'
                            );
                        }
                    }
                });
            }
        });
    });
});

function deleteBook(bookId, bookElement) {
    fetch(`/delete-book/${bookId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                bookElement.remove();
                Swal.fire(
                    'Deletado!',
                    'Seu livro foi deletado.',
                    'success'
                );
            } else {
                Swal.fire(
                    'Erro!',
                    'Erro ao deletar o livro.',
                    'error'
                );
            }
        })
        .catch(error => {
            console.error('Erro ao deletar o livro:', error);
            Swal.fire(
                'Erro!',
                'Erro ao deletar o livro.',
                'error'
            );
        });
}

function deleteFavorite(bookId, bookElement) {
    fetch(`/remove-favorite/${bookId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                bookElement.remove();
                Swal.fire(
                    'Deletado!',
                    'Seu livro favorito foi deletado.',
                    'success'
                );
            } else {
                Swal.fire(
                    'Erro!',
                    'Erro ao deletar o livro favorito.',
                    'error'
                );
            }
        })
        .catch(error => {
            console.error('Erro ao deletar o livro favorito:', error);
            Swal.fire(
                'Erro!',
                'Erro ao deletar o livro favorito.',
                'error'
            );
        });
}