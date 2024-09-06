'use strict'

const loginContainer = document.getElementById('login-container')

const moveOverlay = () => loginContainer.classList.toggle('move')

document.getElementById('open-register').addEventListener('click', moveOverlay)
document.getElementById('open-login').addEventListener('click', moveOverlay)

document.getElementById('open-register-mobile').addEventListener('click', moveOverlay)
document.getElementById('open-login-mobile').addEventListener('click', moveOverlay)

// Exibe informação ao criar conta

document.querySelector('.form-register').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita o envio padrão do formulário

    const fullname = document.getElementById('initials').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const state = document.getElementById('state').value.trim();

    // Verifique se todos os campos têm valor
    if (!fullname || !email || !password || !state) {
        alert('Todos os campos são necessários');
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fullname,
            email,
            password,
            state,
        }),
    })
    .then(response => response.text())
    .then(data => {
        // Exibe a resposta do servidor em um alert
        alert(data);
        // Opcionalmente, você pode limpar o formulário após o envio
        document.querySelector('.form-register').reset();
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});
