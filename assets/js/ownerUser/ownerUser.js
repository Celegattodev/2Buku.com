document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (userId) {
        fetch(`/ownerUser/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Preencher informações do usuário
                    document.getElementById('profile-img').src = data.user.profileImage || '/img/default-profile.png';
                    document.getElementById('user-name').textContent = data.user.name;
                    document.getElementById('user-email').textContent = data.user.email;
                    document.getElementById('user-city').textContent = data.user.city;
                    document.getElementById('user-state').textContent = data.user.state;
                    document.getElementById('user-phone').textContent = data.user.phone;
                    document.getElementById('user-description').textContent = data.user.description;

                    // Carregar livros do usuário
                    const userBooksContainer = document.getElementById('user-books');
                    data.books.forEach(book => {
                        const bookCard = createBookCard(book);
                        userBooksContainer.appendChild(bookCard);
                    });

                    // Carregar livros favoritos do usuário
                    const userFavoritesContainer = document.getElementById('user-favorites');
                    data.favorites.forEach(book => {
                        const bookCard = createBookCard(book);
                        userFavoritesContainer.appendChild(bookCard);
                    });
                } else {
                    Swal.fire('Erro', data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar detalhes do usuário:', error);
                Swal.fire('Erro', 'Erro ao buscar detalhes do usuário. Por favor, tente novamente.', 'error');
            });
    } else {
        Swal.fire('Erro', 'ID do usuário não fornecido.', 'error');
    }
});

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image';

    const image = document.createElement('img');
    image.className = 'product-thumb';
    image.src = book.imageUrl || '/img/default-book-image.jpg';
    image.alt = book.title;

    imageContainer.appendChild(image);

    const info = document.createElement('div');
    info.className = 'product-info';

    const title = document.createElement('h5');
    title.className = 'product-title';
    title.textContent = book.title;

    const author = document.createElement('p');
    author.className = 'product-author';
    author.textContent = book.author;

    info.appendChild(title);
    info.appendChild(author);

    card.appendChild(imageContainer);
    card.appendChild(info);

    return card;
}