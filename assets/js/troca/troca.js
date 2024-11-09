document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        fetch(`/api/exchange-details/${token}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Preencher informações do solicitante
                    document.getElementById('user-name').textContent = data.user.name;
                    document.getElementById('user-phone').textContent = data.user.phone;
                    document.getElementById('user-city').textContent = data.user.city;
                    document.getElementById('user-state').textContent = data.user.state;

                    // Informações do livro ofertado
                    document.getElementById('offered-book-title').textContent = data.book.title;
                    document.getElementById('offered-book-author').textContent = data.book.author;
                    document.getElementById('offered-book-image').src = data.book.imageUrl;

                    // Informações do livro solicitado
                    document.getElementById('requested-book-title').textContent = data.requestedBook.title;
                    document.getElementById('requested-book-author').textContent = data.requestedBook.author;
                    document.getElementById('requested-book-image').src = data.requestedBook.imageUrl;

                    // Adicionar eventos aos botões para ver detalhes dos livros
                    document.getElementById('view-offered-book-details').addEventListener('click', () => viewBookDetails(data.book.id));
                    document.getElementById('view-requested-book-details').addEventListener('click', () => viewBookDetails(data.requestedBook.id));

                    // Eventos para aceitar ou negar a troca
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

function viewBookDetails(bookId) {
    console.log(`Buscando detalhes do livro com ID: ${bookId}`);
    fetch(`/api/exchange-book-details/${bookId}`)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const { title, author, categories, publisher, publishedDate, description, coverImage, images } = data.book;
                let imageGallery = '';
                images.forEach(imageUrl => {
                    imageGallery += `<img src="${imageUrl}" alt="Imagem do Livro" class="book-image">`;
                });

                Swal.fire({
                    title: title,
                    html: `
                        <p><strong>Autor:</strong> ${author}</p>
                        <p><strong>Gênero:</strong> ${categories.join(', ')}</p>
                        <p><strong>Editora:</strong> ${publisher}</p>
                        <p><strong>Ano de Publicação:</strong> ${publishedDate}</p>
                        <p><strong>Sinopse:</strong> ${description}</p>
                        <img src="${coverImage}" alt="Imagem da Capa" class="book-cover">
                        <div class="image-gallery">${imageGallery}</div>
                    `,
                    width: 600,
                    padding: '3em',
                    background: '#fff',
                });
            } else {
                Swal.fire('Erro', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os detalhes do livro:', error);
            Swal.fire('Erro', 'Erro ao carregar os detalhes do livro. Por favor, tente novamente.', 'error');
        });
}

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