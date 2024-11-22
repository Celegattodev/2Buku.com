document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.form-login').addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const adminLogin = document.getElementById('admin-login').checked;

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
                body: JSON.stringify({ email, password, adminLogin })
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
                        window.location.href = data.redirect; // Redireciona para a página de perfil ou admin
                    } else {
                        console.error('URL de redirecionamento não definida.');
                    }
                });
            } else if (data.status === 'banido') {
                const formattedDate = new Date(data.data_banimento).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                Swal.fire({
                    icon: 'error',
                    title: 'Conta Banida',
                    text: `Sua conta foi banida permanentemente em ${formattedDate}. Caso tenha dúvidas, entre em contato pelo email buku.livro@gmail.com.`,
                });
            } else if (data.status === 'suspenso') {
                const formattedDate = new Date(data.suspension_expiry).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                Swal.fire({
                    icon: 'error',
                    title: 'Conta Suspensa',
                    text: `Sua conta está suspensa até ${formattedDate}. Caso tenha dúvidas, entre em contato pelo email buku.livro@gmail.com.`,
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