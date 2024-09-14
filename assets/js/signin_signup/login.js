document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita o envio padrão do formulário

    const formData = new FormData(this);

    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.href = '/user-profile'; // Redireciona para a página de perfil
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});