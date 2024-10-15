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
});

// Pegar os livros do banco de dados
document.addEventListener('DOMContentLoaded', function () {
    fetch('/catalog-data')
        .then(response => response.json())
        .then(data => {
            const popularBooksContainer = document.getElementById('popular-books-container');
            const latestBooksContainer = document.getElementById('latest-books-container');

            data.popularBooks.forEach(book => {
                createBookCard(book).then(bookCard => {
                    popularBooksContainer.appendChild(bookCard);
                });
            });

            data.latestBooks.forEach(book => {
                createBookCard(book).then(bookCard => {
                    latestBooksContainer.appendChild(bookCard);
                });
            });
        })
        .catch(error => console.error('Erro ao carregar os livros:', error));
});

async function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.classList.add('product-card');

    const bookImage = document.createElement('div');
    bookImage.classList.add('product-image');
    const img = document.createElement('img');
    img.src = book.imageUrl || '/img/default-book-image.jpg';
    img.classList.add('product-thumb');
    bookImage.appendChild(img);

    const addButton = document.createElement('button');
    addButton.classList.add('card-btn');
    addButton.textContent = 'Adicionar aos Favoritos ♥';
    addButton.addEventListener('click', (event) => {
        event.stopPropagation();
        addToFavorites(book);
    });
    bookImage.appendChild(addButton);

    bookCard.appendChild(bookImage);

    const bookInfo = document.createElement('div');
    bookInfo.classList.add('product-info');
    const title = document.createElement('h4');
    title.classList.add('product-title');
    title.textContent = book.title;
    bookInfo.appendChild(title);

    const author = document.createElement('p');
    author.classList.add('product-author');
    author.innerHTML = `por <strong>${book.author}</strong>`;
    bookInfo.appendChild(author);

    if (book.genres) {
        const genresContainer = document.createElement('div');
        genresContainer.classList.add('product-genres');
        const translatedGenres = await translateGenres(book.genres);
        const genre = translatedGenres[0]; // Mostrar apenas o primeiro gênero
        const badge = document.createElement('span');
        badge.classList.add('badge', 'rounded-pill', 'text-bg-primary');
        badge.textContent = genre;
        genresContainer.appendChild(badge);
        bookInfo.appendChild(genresContainer);
    }

    bookCard.addEventListener('click', () => showBookDetails(book));

    bookCard.appendChild(bookInfo);

    return bookCard;
}

function showBookDetails(book) {
    fetch(`https://www.googleapis.com/books/v1/volumes/${book.googleBooksId}`)
        .then(response => response.json())
        .then(bookDetails => {
            const bookInfo = bookDetails.volumeInfo;
            Promise.all([
                translateGenres(bookInfo.categories),
                translateText(bookInfo.description)
            ])
                .then(([translatedGenres, translatedDescription]) => {
                    bookInfo.categories = translatedGenres;
                    bookInfo.description = translatedDescription;
                    displayBookDetails(bookInfo);
                })
                .catch(error => {
                    console.error('Erro ao traduzir gêneros ou sinopse:', error);
                    displayBookDetails(bookInfo);
                });
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
                  <img src="${bookInfo.imageLinks?.thumbnail.replace('http://', 'https://') || 'https://via.placeholder.com/128x192.png?text=No+Cover'}" class="img-fluid mb-3" alt="${bookInfo.title}">
                </div>
                <div class="col-md-8">
                  <p><strong>Autor:</strong> ${bookInfo.authors?.join(', ') || 'Desconhecido'}</p>
                  <p><strong>Gênero:</strong> ${bookInfo.categories?.join(', ') || 'Desconhecido'}</p>
                  <p><strong>Editora:</strong> ${bookInfo.publisher || 'Desconhecido'}</p>
                  <p><strong>Ano de Publicação:</strong> ${formatDate(bookInfo.publishedDate) || 'Desconhecido'}</p>
                  <p><strong>Sinopse:</strong> ${bookInfo.description || 'Não disponível'}</p>
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
        body: JSON.stringify(book)
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
            } else if (data.message === 'A tabela de biblioteca não existe. Por favor, contate o suporte.') {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'A tabela de biblioteca não existe. Por favor, contate o suporte.',
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