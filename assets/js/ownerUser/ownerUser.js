document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (userId) {
        fetch(`/api/ownerUser/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Preencher informações do usuário
                    document.getElementById('profile-img').src = data.user.profileImage || '/img/profile-image/th.jpeg';
                    document.getElementById('user-name').textContent = data.user.name;
                    document.getElementById('user-state').textContent = data.user.state;
                    document.getElementById('user-description').textContent = data.user.description;

                    // Atualizar o título com o nome do usuário
                    document.querySelector('.title h3').textContent = `Perfil do ${data.user.name}`;

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

                    // Adicionar funcionalidade de navegação
                    addCarouselNavigation();
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
function addCarouselNavigation() {
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(carousel => {
        const preBtn = carousel.querySelector('.pre-btn');
        const nxtBtn = carousel.querySelector('.nxt-btn');
        const container = carousel.querySelector('.product-container');

        preBtn.addEventListener('click', () => {
            container.scrollLeft -= container.offsetWidth;
        });

        nxtBtn.addEventListener('click', () => {
            container.scrollLeft += container.offsetWidth;
        });
    });
}

fetch(`/ownerUser/${userId}`)
    .then(response => response.json())
    .then(data => {
        console.log('Dados recebidos:', data); // Log para verificar os dados recebidos

        if (data.success) {
            // Log cada campo para confirmar que os dados existem
            console.log('User:', data.user);
            console.log('Books:', data.books);
            console.log('Favorites:', data.favorites);

            document.getElementById('profile-img').src = data.user.profileImage || '/img/profile-image/th.jpeg';
            document.getElementById('user-name').textContent = data.user.name;
            document.getElementById('user-email').textContent = data.user.email;
            document.getElementById('user-city').textContent = data.user.city;
            document.getElementById('user-state').textContent = data.user.state;
            document.getElementById('user-phone').textContent = data.user.phone;
            document.getElementById('user-description').textContent = data.user.biography;

            // Verifique os livros do usuário
            const userBooksContainer = document.getElementById('user-books');
            data.books.forEach(book => {
                const bookCard = createBookCard(book);
                userBooksContainer.appendChild(bookCard);
            });

            // Verifique os livros favoritos do usuário
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
