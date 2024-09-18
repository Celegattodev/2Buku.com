document.addEventListener("DOMContentLoaded", () => {
    const deleteButton = document.getElementById("delete-account-button");
  
    if (deleteButton) {
      deleteButton.addEventListener("click", async () => {
        const result = await Swal.fire({
          title: 'Tem certeza?',
          text: "Esta ação deletará permanentemente sua conta!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sim, deletar!',
          cancelButtonText: 'Cancelar'
        });
  
        if (result.isConfirmed) {
          try {
            const response = await fetch('/delete-account', { method: 'GET' });
            const result = await response.json();
  
            if (response.ok && result.success) {
              // Alerta de sucesso
              await Swal.fire({
                icon: 'success',
                title: 'Conta deletada!',
                text: result.message
              });
  
              // Redirecionar após o alerta para a página de login
              window.location.href = '/login';
            } else {
              // Alerta de erro
              await Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: result.message || 'Houve um erro ao deletar a conta. Tente novamente.'
              });
            }
          } catch (error) {
            // Alerta de erro
            await Swal.fire({
              icon: 'error',
              title: 'Erro',
              text: 'Houve um erro ao deletar a conta. Tente novamente.'
            });
          }
        }
      });
    }
  });