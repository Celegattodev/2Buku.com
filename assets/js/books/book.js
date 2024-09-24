$(document).ready(function () {
    // Evento de clique no ícone de deletar
    $('.swiper-wrapper').on('click', '.delete-icon', function () {
        const bookItem = $(this).closest('.book-item');
        const bookId = bookItem.data('book-id'); // Obtém o ID do livro

        // Exibe o alerta de confirmação
        Swal.fire({
            title: 'Você tem certeza?',
            text: "Isso não pode ser desfeito!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, deletar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Faz a requisição AJAX para deletar o livro
                $.ajax({
                    url: `/delete-book/${bookId}`, // Rota para deletar o livro
                    type: 'DELETE',
                    success: function (response) {
                        // Se o livro foi deletado com sucesso, remove o item da interface
                        bookItem.remove();

                        // Exibe o alerta de sucesso
                        Swal.fire(
                            'Deletado!',
                            'O livro foi deletado com sucesso.',
                            'success'
                        );
                    },
                    error: function (error) {
                        console.error('Erro ao deletar o livro:', error);
                        Swal.fire(
                            'Erro!',
                            'Ocorreu um erro ao tentar deletar o livro.',
                            'error'
                        );
                    }
                });
            }
        });
    });
});
