document.addEventListener('DOMContentLoaded', function () {
    // Obter os dados do administrador da sessão
    fetch('/api/admin-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('profile-name').textContent = data.name;
                document.getElementById('profile-email').textContent = `${data.email} - ${data.state}`;
                document.getElementById('profile-city').textContent = data.city;
                document.getElementById('profile-phone').textContent = data.phone;
                document.getElementById('profile-description').textContent = data.biography;
            } else {
                console.error('Erro ao obter dados do administrador:', data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao obter dados do administrador:', error);
        });

    // Adicionar funcionalidade de logout
    document.getElementById('logout-button').addEventListener('click', function () {
        fetch('/logout')
            .then(response => {
                if (response.ok) {
                    window.location.href = '/login';
                } else {
                    console.error('Erro ao fazer logout');
                }
            })
            .catch(error => {
                console.error('Erro ao fazer logout:', error);
            });
    });
});