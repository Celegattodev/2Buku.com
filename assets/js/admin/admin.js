document.addEventListener('DOMContentLoaded', function () {
    // Obter os dados do administrador da sessão
    fetch('/api/admin-data')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('profile-name').textContent = data.adminName;
                document.getElementById('profile-email').textContent = `${data.adminEmail} - ${data.adminState}`;
                document.getElementById('profile-city').textContent = data.adminCity;
                document.getElementById('profile-phone').textContent = data.adminPhone;
                document.getElementById('profile-description').textContent = data.adminBiography;
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