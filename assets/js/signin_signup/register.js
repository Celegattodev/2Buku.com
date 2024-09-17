// Função para manipular o registro
const registerForm = document.querySelector('.form-register');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita o envio padrão do formulário

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const stateSelect = document.getElementById('state');
        const citySelect = document.getElementById('city');
        const privacyPolicyCheckbox = document.getElementById('privacy-policy');

        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !stateSelect || !citySelect) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Por favor, preencha todos os campos do formulário.',
            });
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const state = stateSelect.value;
        const city = citySelect.value;

        // Validação no frontend
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!name || !email || !password || !confirmPassword || !state || !city) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Todos os campos são obrigatórios.',
            });
            return;
        }

        if (!passwordRegex.test(password)) {
            Swal.fire({
                icon: 'error',
                title: 'Senha inválida',
                text: 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.',
            });
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'As senhas não coincidem.',
            });
            return;
        }

        if (!privacyPolicyCheckbox.checked) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção',
                text: 'Você deve aceitar a Política de Privacidade para se registrar.',
            });
            return;
        }

        // Envio via fetch
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                state,
                city,
            }),
        })
            .then(response => response.json()) // Espera uma resposta JSON do servidor
            .then(data => {
                if (data.success) {
                    // Registro bem-sucedido
                    Swal.fire({
                        icon: 'success',
                        title: 'Cadastro realizado!',
                        text: data.message,
                    }).then(() => {
                        window.location.href = '/'; // Redireciona para a página de login
                    });
                } else {
                    // Registro falhou, exibe a mensagem de erro
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: data.message || 'Ocorreu um erro ao registrar a conta.',
                    });
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um erro ao fazer o registro. Por favor, tente novamente.',
                });
            });
    });
} else {
    console.error('Formulário de registro não encontrado.');
}
