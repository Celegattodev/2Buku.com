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
        const imageUrl = bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192.png?text=No+Cover';

        const bookCard = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${imageUrl}" class="card-img-top" alt="${bookInfo.title}">
                    <div class="card-body">
                        <h5 class="card-title">${bookInfo.title}</h5>
                        <p class="card-text">Autor: ${bookInfo.authors?.join(', ') || 'Desconhecido'}</p>
                        <button class="btn btn-success" onclick="addToLibrary('${bookInfo.title}', '${bookInfo.authors?.join(', ')}', '${imageUrl}')">Adicionar à Biblioteca</button>
                    </div>
                </div>
            </div>
        `;
        bookResults.innerHTML += bookCard;
    });
}

function addToLibrary(title, author, imageUrl) {
    fetch('/add-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, author, imageUrl })
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
                    text: 'Erro ao adicionar o livro.',
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
}

// Voltar para o perfil
document.getElementById('backToProfile').addEventListener('click', function () {
    window.location.href = '/profile'; 
});
