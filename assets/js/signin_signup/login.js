document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.form-login').addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Por favor, preencha ambos os campos de email e senha.',
            });
            return;
        }

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data); // Adiciona um log para depuração

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: data.message,
                }).then(() => {
                    if (data.redirect) {
                        window.location.href = data.redirect; // Redireciona para a página de perfil
                    } else {
                        console.error('URL de redirecionamento não definida.');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: data.message || 'Email ou senha incorretos.',
                });
            }
        } catch (error) {
            console.error('Erro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro no servidor',
                text: 'Ocorreu um erro ao fazer login. Por favor, tente novamente.',
            });
        }
    });
});
