document.addEventListener('DOMContentLoaded', () => {
    // Função para mostrar o alerta
    const showLogoutAlert = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const logout = urlParams.get('logout');

        if (logout === 'success') {
            Swal.fire({
                title: 'Logout bem-sucedido!',
                text: 'Você foi desconectado com sucesso.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        }
    };

    // Chama a função ao carregar a página
    showLogoutAlert();
});