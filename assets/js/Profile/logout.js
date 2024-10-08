// logout.js

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
            }).then(() => {
                // Redireciona para a página de inscrição após o alerta
                window.location.href = '/inscricao-buku.html';
            });
        } else if (logout === 'error') {
            Swal.fire({
                title: 'Erro ao fazer logout',
                text: 'Ocorreu um erro ao desconectar.',
                icon: 'error',
                confirmButtonText: 'OK'
            }).then(() => {
                // Redireciona para a página de inscrição após o alerta
                window.location.href = '/inscricao-buku.html';
            });
        }
    };

    // Chama a função ao carregar a página
    showLogoutAlert();
});