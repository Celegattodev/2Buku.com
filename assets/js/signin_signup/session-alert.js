document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('sessionExpired') === 'true') {
        alert('Sua sessão expirou por inatividade. Por favor, faça login novamente.');
    }
});
