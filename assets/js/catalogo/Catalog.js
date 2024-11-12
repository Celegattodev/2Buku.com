document.addEventListener("DOMContentLoaded", function () {
    const productContainers = [...document.querySelectorAll('.product-container')];
    const nxtBtn = [...document.querySelectorAll('.nxt-btn')];
    const preBtn = [...document.querySelectorAll('.pre-btn')];
    const scrollAmount = 800;

    productContainers.forEach((item, i) => {
        nxtBtn[i].addEventListener('click', () => {
            item.scrollLeft += scrollAmount;
        });

        preBtn[i].addEventListener('click', () => {
            item.scrollLeft -= scrollAmount;
        });
    });

    // Pegar os livros do banco de dados
    fetch('/catalog-data')
        .then(response => response.json())
        .then(data => {
            const popularBooksContainer = document.getElementById('popular-books-container');
            const latestBooksContainer = document.getElementById('latest-books-container');

            // Verifique a estrutura de dados recebida
            console.log('Dados de livros recebidos:', data);

            data.popularBooks.forEach(book => {
                console.log('Criando cartão para livro popular:', book);
                const bookCard = createCatalogBookCard(book);
                popularBooksContainer.appendChild(bookCard);
            });

            data.latestBooks.forEach(book => {
                console.log('Criando cartão para livro mais recente:', book);
                const bookCard = createCatalogBookCard(book);
                latestBooksContainer.appendChild(bookCard);
            });
        })
        .catch(error => console.error('Erro ao carregar os livros:', error));
});

function createCatalogBookCard(book) {
    console.log('Dados do livro ao criar cartão:', book); // Log para depuração

    const bookCard = document.createElement('div');
    bookCard.classList.add('product-card');
    bookCard.setAttribute('data-google-books-id', book.googleBooksId || 'ID não disponível');
    bookCard.setAttribute('data-user-id', book.userId || 'Usuário não disponível');

    const bookImage = document.createElement('div');
    bookImage.classList.add('product-image');
    const img = document.createElement('img');
    img.src = book.imageUrl || '/img/default-book-image.jpg';
    img.classList.add('product-thumb');
    bookImage.appendChild(img);
    bookCard.appendChild(bookImage);

    const bookInfo = document.createElement('div');
    bookInfo.classList.add('product-info');

    const title = document.createElement('h4');
    title.classList.add('product-title');
    title.textContent = book.title || 'Título não disponível';
    bookInfo.appendChild(title);

    const author = document.createElement('p');
    author.classList.add('product-author');
    author.innerHTML = `por <strong>${book.author || 'Autor desconhecido'}</strong>`;
    bookInfo.appendChild(author);

    // Botões
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const addToFavoritesButton = document.createElement('button');
    addToFavoritesButton.classList.add('btn', 'btn-primary', 'btn-sm');
    addToFavoritesButton.textContent = 'Adicionar aos Desejados ♥';
    addToFavoritesButton.addEventListener('click', (event) => {
        event.stopPropagation();
        addToFavorites(book);
    });

    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    viewDetailsButton.textContent = 'Ver Detalhes';
    viewDetailsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        showBookDetails(book);
    });

    const requestExchangeButton = document.createElement('button');
    requestExchangeButton.classList.add('btn', 'btn-success', 'btn-sm');
    requestExchangeButton.textContent = 'Solicitar Troca';
    requestExchangeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        requestExchange(book);
    });

    const ownerUserButton = document.createElement('button');
    ownerUserButton.classList.add('btn', 'btn-owner', 'btn-sm');
    ownerUserButton.textContent = 'Ver Usuário';

    if (book.userId) {
        ownerUserButton.addEventListener('click', (event) => {
            event.stopPropagation();
            window.location.href = `/ownerUser?userId=${book.userId}`;
        });
    } else {
        console.error('User ID não encontrado para este livro');
    }

    buttonContainer.appendChild(addToFavoritesButton);
    buttonContainer.appendChild(viewDetailsButton);
    buttonContainer.appendChild(requestExchangeButton);
    buttonContainer.appendChild(ownerUserButton);
    bookInfo.appendChild(buttonContainer);
    bookCard.appendChild(bookInfo);

    console.log('Cartão criado para o livro:', book.title || 'Título não disponível');

    return bookCard;
}

function createSearchBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.classList.add('product-card');
    bookCard.setAttribute('data-google-books-id', book.googleBooksId || 'ID não disponível');

    // Imagem do livro
    const bookImage = document.createElement('div');
    bookImage.classList.add('product-image');
    const img = document.createElement('img');
    img.src = book.imageUrl || '/img/default-book-image.jpg'; // Valor padrão para imagem
    img.classList.add('product-thumb');
    bookImage.appendChild(img);
    bookCard.appendChild(bookImage);

    // Informações do livro
    const bookInfo = document.createElement('div');
    bookInfo.classList.add('product-info');

    // Título do livro com verificação de valor
    const title = document.createElement('h4');
    title.classList.add('product-title');
    title.textContent = book.titulo || 'Título não disponível'; // Atualizado para `titulo`
    bookInfo.appendChild(title);

    // Autor com verificação de valor
    const author = document.createElement('p');
    author.classList.add('product-author');
    author.innerHTML = `por <strong>${book.autor || 'Autor desconhecido'}</strong>`; // Atualizado para `autor`
    bookInfo.appendChild(author);

    // Container de botões para interações
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // Botão "Adicionar aos Favoritos"
    const addToFavoritesButton = document.createElement('button');
    addToFavoritesButton.classList.add('btn', 'btn-primary', 'btn-sm');
    addToFavoritesButton.textContent = 'Adicionar aos Desejados ♥';
    addToFavoritesButton.addEventListener('click', (event) => {
        event.stopPropagation();
        addToFavorites(book);
    });

    // Botão "Ver Detalhes"
    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.classList.add('btn', 'btn-secondary', 'btn-sm');
    viewDetailsButton.textContent = 'Ver Detalhes';
    viewDetailsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        showBookDetails(book);
    });

    // Botão "Solicitar Troca"
    const requestExchangeButton = document.createElement('button');
    requestExchangeButton.classList.add('btn', 'btn-success', 'btn-sm');
    requestExchangeButton.textContent = 'Solicitar Troca';
    requestExchangeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        requestExchange(book);
    });

    // Botão "Ver Usuário" com verificação de userId
    const ownerUserButton = document.createElement('button');
    ownerUserButton.classList.add('btn', 'btn-owner', 'btn-sm');
    ownerUserButton.textContent = 'Ver Usuário';

    if (book.userId) {
        ownerUserButton.addEventListener('click', (event) => {
            event.stopPropagation();
            window.location.href = `/ownerUser?userId=${book.userId}`;
        });
    } else {
        console.error('User ID não encontrado para este livro');
    }

    // Adiciona os botões ao container e o container ao cartão
    buttonContainer.appendChild(addToFavoritesButton);
    buttonContainer.appendChild(viewDetailsButton);
    buttonContainer.appendChild(requestExchangeButton);
    buttonContainer.appendChild(ownerUserButton);
    bookInfo.appendChild(buttonContainer);

    // Adiciona informações e o container de botões ao cartão
    bookCard.appendChild(bookInfo);

    console.log('Criando card para o livro:', book); // Log para depuração

    return bookCard;
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

function showBookDetails(book) {
    const googleBooksId = book.googleBooksId; // Certifique-se de que o ID do livro está correto
    console.log(`Buscando detalhes do livro com Google Books ID: ${googleBooksId}`);
    fetch(`/api/catalog-book-details/${googleBooksId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar detalhes do livro');
            }
            return response.json();
        })
        .then(bookDetails => {
            if (bookDetails.success) {
                const bookInfo = bookDetails.book;
                console.log('Detalhes do livro recebidos:', bookInfo);
                displayBookDetails(bookInfo);
            } else {
                console.error('Erro ao buscar detalhes do livro:', bookDetails.message);
            }
        })
        .catch(error => console.error('Erro ao buscar detalhes do livro:', error));
}

function displayBookDetails(bookInfo) {
    const modalContent = `
      <div class="modal fade" id="bookDetailsModal" tabindex="-1" aria-labelledby="bookDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bookDetailsModalLabel">${bookInfo.title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-4">
                  <img src="${bookInfo.coverImage.replace('http://', 'https://') || 'https://via.placeholder.com/128x192.png?text=No+Cover'}" class="img-fluid mb-3" alt="${bookInfo.title}">
                </div>
                <div class="col-md-8">
                  <p><strong>Autor:</strong> ${bookInfo.author || 'Desconhecido'}</p>
                  <p><strong>Gênero:</strong> ${(bookInfo.categories && bookInfo.categories.length > 0) ? bookInfo.categories.join(', ') : 'Desconhecido'}</p>
                  <p><strong>Editora:</strong> ${bookInfo.publisher || 'Desconhecido'}</p>
                  <p><strong>Ano de Publicação:</strong> ${formatDate(bookInfo.publishedDate) || 'Desconhecido'}</p>
                  <p><strong>Sinopse:</strong> ${bookInfo.description || 'Não disponível'}</p>
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-12">
                  <h5>Imagens do Livro</h5>
                  <div class="row">
                    ${(bookInfo.images && bookInfo.images.length > 0) ? bookInfo.images.map(imageUrl => `
                      <div class="col-md-4">
                        <img src="${imageUrl}" class="img-fluid mb-3" alt="Imagem do Livro">
                      </div>
                    `).join('') : '<p>Não há imagens disponíveis</p>'}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modalContainer').innerHTML = modalContent;
    const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
    modal.show();
}

async function translateGenres(genres) {
    if (!genres || genres.length === 0) return ['Desconhecido'];
    const apiKey = 'AIzaSyCvKVY6ptNvOngJl4KgOSIEQPrTXafOQ_k'; // Chave da API fornecida
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const translatedGenres = await Promise.all(genres.map(async (genre) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: genre,
                    source: 'en',
                    target: 'pt'
                })
            });
            const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Erro ao traduzir gênero:', error);
            return genre; // Retorna o gênero original em caso de erro
        }
    }));

    return translatedGenres;
}

async function translateText(text) {
    if (!text) return 'Não disponível';
    const apiKey = 'AIzaSyCvKVY6ptNvOngJl4KgOSIEQPrTXafOQ_k'; // Chave da API fornecida
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: 'pt'
            })
        });
        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Erro ao traduzir texto:', error);
        return text; // Retorna o texto original em caso de erro
    }
}

function formatDate(date) {
    if (!date) return 'Desconhecido';
    const [year, month, day] = date.split('-');
    return `${day || '01'}/${month || '01'}/${year}`;
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
                    text: 'Livro adicionado aos desjados com sucesso!',
                });
            } else if (data.message === 'Livro já está nos desejados') {
                Swal.fire({
                    icon: 'info',
                    title: 'Informação',
                    text: 'Este livro já está na sua lista de desejos.',
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
                    text: data.message || 'Erro ao adicionar o livro aos desejados.',
                });
            }
        })
        .catch(error => {
            console.error('Erro ao adicionar o livro aos desejados:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao adicionar o livro aos desejados.',
            });
        });
}

async function searchBooks(event) {
    event.preventDefault();

    const searchInput = document.getElementById('searchInput').value;
    const bookResults = document.getElementById('bookResults');
    bookResults.innerHTML = ''; // Limpa os resultados anteriores

    try {
        const response = await fetch(`/search-books?q=${encodeURIComponent(searchInput)}`);
        const data = await response.json();

        console.log('Dados retornados pela pesquisa:', data); // Adicione este log

        if (data.success) {
            if (data.books.length === 0) {
                bookResults.innerHTML = '<p class="text-center w-100">Livro não encontrado 😕</p>';
            } else {
                data.books.forEach(async (book) => {
                    console.log('Dados do livro passado para createSearchBookCard:', book); // Adicione este log
                    const bookCard = await createSearchBookCard(book);
                    const bookElement = document.createElement('div');
                    bookElement.classList.add('col-md-4', 'mb-3');
                    bookElement.appendChild(bookCard);
                    bookResults.appendChild(bookElement);
                });
            }
        } else {
            bookResults.innerHTML = '<p class="text-center w-100">Livro não encontrado :/</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        bookResults.innerHTML = '<p class="text-center w-100">Erro ao buscar livros.</p>';
    }
}