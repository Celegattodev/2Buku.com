document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value;
    if (query) {
        searchBooks(query);
    } else {
        alert('Por favor, insira o nome de um livro para pesquisar.');
    }
});

function searchBooks(query) {
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => displayBooks(data.items || []))
        .catch(error => console.error('Erro ao buscar livros:', error));
}

function displayBooks(books) {
    const bookResults = document.getElementById('bookResults');
    bookResults.innerHTML = ''; // Limpa os resultados anteriores

    if (books.length === 0) {
        bookResults.innerHTML = '<p>Nenhum livro encontrado.</p>';
        return;
    }

    books.forEach(book => {
        const bookInfo = book.volumeInfo;
        const imageUrl = bookInfo.imageLinks?.thumbnail.replace('http://', 'https://') || 'https://via.placeholder.com/128x192.png?text=No+Cover';

        const bookCard = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${imageUrl}" class="card-img-top" alt="${bookInfo.title}">
                    <div class="card-body">
                        <h5 class="card-title">${bookInfo.title}</h5>
                        <p class="card-text">Autor: ${bookInfo.authors?.join(', ') || 'Desconhecido'}</p>
                        <button class="btn btn-info" onclick="showBookDetails('${book.id}')">Ver Detalhes</button>
                        <button class="btn btn-success" onclick="promptForImages('${book.id}', '${bookInfo.title}', '${bookInfo.authors?.join(', ')}', '${imageUrl}')">Adicionar à Biblioteca</button>
                        <button class="btn btn-warning text-white" onclick="addToFavorites('${book.id}', '${bookInfo.title}', '${bookInfo.authors?.join(', ')}', '${imageUrl}')">Adicionar aos Favoritos</button>
                    </div>
                </div>
            </div>
        `;
        bookResults.innerHTML += bookCard;
    });
}

function showBookDetails(bookId) {
    fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
        .then(response => response.json())
        .then(book => {
            const bookInfo = book.volumeInfo;
            if (!bookInfo.description || !bookInfo.categories || !bookInfo.publishedDate || !bookInfo.publisher) {
                fetchOpenLibraryDetails(bookInfo.title);
            } else {
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
            }
        })
        .catch(error => console.error('Erro ao buscar detalhes do livro:', error));
}

function fetchOpenLibraryDetails(title) {
    fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`)
        .then(response => response.json())
        .then(data => {
            if (data.docs && data.docs.length > 0) {
                const bookInfo = data.docs[0];
                const bookDetails = {
                    title: bookInfo.title,
                    authors: bookInfo.author_name,
                    categories: bookInfo.subject,
                    publisher: bookInfo.publisher,
                    publishedDate: bookInfo.first_publish_year,
                    description: bookInfo.first_sentence ? bookInfo.first_sentence[0] : 'Não disponível',
                    imageLinks: {
                        thumbnail: `https://covers.openlibrary.org/b/id/${bookInfo.cover_i}-L.jpg`
                    }
                };
                Promise.all([
                    translateGenres(bookDetails.categories),
                    translateText(bookDetails.description)
                ])
                    .then(([translatedGenres, translatedDescription]) => {
                        bookDetails.categories = translatedGenres;
                        bookDetails.description = translatedDescription;
                        displayBookDetails(bookDetails);
                    })
                    .catch(error => {
                        console.error('Erro ao traduzir gêneros ou sinopse:', error);
                        displayBookDetails(bookDetails);
                    });
            } else {
                alert('Informações adicionais não encontradas.');
            }
        })
        .catch(error => console.error('Erro ao buscar detalhes do livro na Open Library:', error));
}

function displayBookDetails(bookInfo) {
    const modalContent = `
        <div class="modal fade" id="bookDetailsModal" tabindex="-1" aria-labelledby="bookDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bookDetailsModalLabel">${bookInfo.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <img src="${bookInfo.imageLinks?.thumbnail.replace('http://', 'https://') || 'https://via.placeholder.com/128x192.png?text=No+Cover'}" class="img-fluid mb-3" alt="${bookInfo.title}">
                        <p><strong>Autor:</strong> ${bookInfo.authors?.join(', ') || 'Desconhecido'}</p>
                        <p><strong>Gênero:</strong> ${bookInfo.categories?.join(', ') || 'Desconhecido'}</p>
                        <p><strong>Editora:</strong> ${bookInfo.publisher || 'Desconhecido'}</p>
                        <p><strong>Ano de Publicação:</strong> ${formatDate(bookInfo.publishedDate) || 'Desconhecido'}</p>
                        <p><strong>Sinopse:</strong> ${bookInfo.description || 'Não disponível'}</p>
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

function translateGenres(genres) {
    if (!genres) return Promise.resolve(['Desconhecido']);
    const apiKey = 'SUA_CHAVE_DE_API_DO_GOOGLE_TRANSLATE'; // Substitua pela sua chave de API do Google Translate
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    const requests = genres.map(genre => {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: genre,
                source: 'en',
                target: 'pt'
            })
        })
            .then(response => response.json())
            .then(data => data.data.translations[0].translatedText)
            .catch(error => {
                console.error('Erro ao traduzir gênero:', error);
                return genre; // Retorna o gênero original em caso de erro
            });
    });
    return Promise.all(requests);
}

function translateText(text) {
    if (!text) return Promise.resolve('Não disponível');
    const apiKey = 'SUA_CHAVE_DE_API_DO_GOOGLE_TRANSLATE'; // Substitua pela sua chave de API do Google Translate
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            q: text,
            source: 'en',
            target: 'pt'
        })
    })
        .then(response => response.json())
        .then(data => data.data.translations[0].translatedText)
        .catch(error => {
            console.error('Erro ao traduzir texto:', error);
            return text; // Retorna o texto original em caso de erro
        });
}

function formatDate(date) {
    if (!date) return 'Desconhecido';
    const [year, month, day] = date.split('-');
    return `${day || '01'}/${month || '01'}/${year}`;
}

function promptForImages(googleBooksId, title, author, imageUrl) {
    Swal.fire({
        title: 'Anexar imagens do estado do livro',
        html: `
            <input type="file" id="bookImages" name="bookImages" class="form-control" accept="image/*" multiple required>
            <p class="mt-2">Mínimo 3, máximo 8 imagens.</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Adicionar à Biblioteca',
        preConfirm: () => {
            const bookImages = document.getElementById('bookImages').files;
            if (bookImages.length < 3 || bookImages.length > 8) {
                Swal.showValidationMessage('Você deve anexar entre 3 e 8 imagens do estado do livro.');
                return false;
            }
            return bookImages;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addToLibrary(googleBooksId, title, author, imageUrl, result.value);
        }
    });
}

function addToLibrary(googleBooksId, title, author, imageUrl, bookImages) {
    const formData = new FormData();
    formData.append('googleBooksId', googleBooksId);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('imageUrl', imageUrl);

    for (let i = 0; i < bookImages.length; i++) {
        formData.append('bookImages', bookImages[i]);
    }

    // Primeiro, verificar se o livro já existe na biblioteca ou nos favoritos
    fetch('/check-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ googleBooksId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Se o livro não existir, prosseguir com o upload das imagens e adicionar o livro
                fetch('/add-book', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                title: 'Sucesso!',
                                text: 'Livro adicionado com sucesso!',
                                icon: 'success',
                                confirmButtonText: 'Ok'
                            });
                        } else {
                            Swal.fire({
                                title: 'Erro!',
                                text: data.message || 'Erro ao adicionar o livro.',
                                icon: 'error',
                                confirmButtonText: 'Ok'
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao adicionar o livro:', error);
                        Swal.fire({
                            title: 'Erro!',
                            text: 'Erro ao adicionar o livro.',
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        });
                    });
            } else if (data.message === 'Livro já existe na biblioteca' || data.message === 'Livro já está nos favoritos') {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'Este livro já existe na sua biblioteca ou nos seus favoritos.',
                    icon: 'info',
                    confirmButtonText: 'Ok'
                });
            } else {
                Swal.fire({
                    title: 'Erro!',
                    text: data.message || 'Erro ao verificar a duplicidade do livro.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        })
        .catch(error => {
            console.error('Erro ao verificar a duplicidade do livro:', error);
            Swal.fire({
                title: 'Erro!',
                text: 'Erro ao verificar a duplicidade do livro.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        });
}

function addToFavorites(googleBooksId, title, author, imageUrl) {
    fetch('/add-favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ googleBooksId, title, author, imageUrl })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Livro adicionado aos favoritos com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
            } else if (data.message === 'Livro já está nos favoritos' || data.message === 'Livro já está na biblioteca') {
                Swal.fire({
                    title: 'Atenção!',
                    text: 'Este livro já está na sua biblioteca ou nos seus favoritos.',
                    icon: 'info',
                    confirmButtonText: 'Ok'
                });
            } else {
                Swal.fire({
                    title: 'Erro!',
                    text: data.message || 'Erro ao adicionar o livro aos favoritos.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        })
        .catch(error => {
            console.error('Erro ao adicionar o livro aos favoritos:', error);
            Swal.fire({
                title: 'Erro!',
                text: 'Erro ao adicionar o livro aos favoritos.',
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        });
}

// Voltar para o perfil
document.getElementById('backToProfile').addEventListener('click', function () {
    window.location.href = '/profile';
});