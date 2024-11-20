document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.form-alert').addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário

        const email = document.getElementById('alert-email').value.trim();
        const message = document.getElementById('alert-message').value.trim();
        const punishment = document.querySelector('input[name="punishment"]:checked').value;

        if (!email || !message || !punishment) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Por favor, preencha todos os campos.',
            });
            return;
        }

        try {
            const response = await fetch('/send-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message, punishment })
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data); // Adiciona um log para depuração

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: data.message,
                }).then(() => {
                    window.location.href = '/admin';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: data.message || 'Erro ao enviar alerta.',
                });
            }
        } catch (error) {
            console.error('Erro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erro no servidor',
                text: 'Ocorreu um erro ao enviar o alerta. Por favor, tente novamente.',
            });
        }
    });
});