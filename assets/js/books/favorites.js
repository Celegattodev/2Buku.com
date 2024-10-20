document.addEventListener('DOMContentLoaded', function () {
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
                bookElement.remove();
                Swal.fire(
                    'Deletado!',
                    'Seu livro favorito foi deletado.',
                    'success'
                );
            } else {
                Swal.fire(
                    'Erro!',
                    data.message || 'Erro ao deletar o livro favorito.',
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