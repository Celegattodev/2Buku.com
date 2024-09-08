document.querySelector('.form-login').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita o envio padrão do formulário

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Verifique se ambos os campos foram preenchidos
    if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Faz o envio dos dados de login para o servidor
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .then(data => {
        alert(data.message); // Exibe mensagem de sucesso
        if (data.success) {
            window.location.href = data.redirect; // Redireciona para a página de perfil
        }
    })
    .catch(error => {
        alert(error.message); // Exibe mensagem de erro
    });
});


// Mensangem de erro 

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch('/login', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.href = data.redirect;
        } else {
            alert(data.message); // Exibe o erro de login
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao tentar realizar o login. Tente novamente mais tarde.');
    });
});