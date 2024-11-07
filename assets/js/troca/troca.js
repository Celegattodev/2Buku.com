document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        fetch(`/api/exchange-details/${token}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('user-name').textContent = data.user.name;
                    document.getElementById('user-phone').textContent = data.user.phone;
                    document.getElementById('user-city').textContent = data.user.city;
                    document.getElementById('user-state').textContent = data.user.state;

                    // Livro ofertado
                    document.getElementById('offered-book-title').textContent = data.book.title;
                    document.getElementById('offered-book-author').textContent = data.book.author;
                    document.getElementById('offered-book-image').src = data.book.imageUrl;

                    // Livro solicitado
                    document.getElementById('requested-book-title').textContent = data.requestedBook.title;
                    document.getElementById('requested-book-author').textContent = data.requestedBook.author;
                    document.getElementById('requested-book-image').src = data.requestedBook.imageUrl;

                    // Adicionar eventos aos botões
                    document.getElementById('confirm-button').addEventListener('click', () => handleExchangeAction(token, 'accept'));
                    document.getElementById('deny-button').addEventListener('click', () => handleExchangeAction(token, 'deny'));
                } else {
                    Swal.fire('Erro', data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar detalhes da troca:', error);
                Swal.fire('Erro', 'Erro ao buscar detalhes da troca. Por favor, tente novamente.', 'error');
            });
    } else {
        Swal.fire('Erro', 'Token não fornecido.', 'error');
    }
});

function handleExchangeAction(token, action) {
    Swal.fire({
        title: 'Processando...',
        text: 'Por favor, aguarde enquanto processamos sua solicitação.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(`/api/exchange-action`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, action })
    })
    .then(response => response.json())
    .then(data => {
        Swal.close();
        if (data.success) {
            if (action === 'accept') {
                Swal.fire('Sucesso', 'Troca concluída com sucesso! Entre em contato com o outro usuário para combinar a entrega.', 'success')
                    .then(() => {
                        window.location.href = '/catalog';
                    });
            } else {
                Swal.fire('Informação', 'Troca não foi concretizada.', 'info')
                    .then(() => {
                        window.location.href = '/catalog';
                    });
            }
        } else {
            Swal.fire('Erro', data.message, 'error');
        }
    })
    .catch(error => {
        Swal.close();
        console.error('Erro ao processar a ação da troca:', error);
        Swal.fire('Erro', 'Erro ao processar a ação da troca. Por favor, tente novamente.', 'error');
    });
}