document.addEventListener('DOMContentLoaded', () => {
  // Carrega dados do perfil
  fetch('/api/profile')
    .then(response => response.json())
    .then(data => {
      if (data) {
        document.getElementById('name').value = data.name || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('biography').value = data.biography || '';

        const imagePreview = document.querySelector('#img-profile-div img');
        if (data.image) {
          imagePreview.src = data.image;
        } else {
          imagePreview.src = '/img/profile-placeholder.png';
        }
      }
    });

  // Adiciona o listener ao formulário
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      const formData = new FormData(this);

      fetch('/update-profile', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          // Exibe o alerta baseado na resposta do servidor
          if (data.success) {
            showSuccessAlert();
          } else {
            showErrorAlert(data.message || 'Erro desconhecido.');
          }
        })
        .catch(error => {
          console.error('Erro ao atualizar perfil:', error);
          showErrorAlert('Houve um problema ao atualizar seu perfil. Por favor, tente novamente.');
        });
    });
  }
});

// Função para mostrar alerta de sucesso
function showSuccessAlert() {
  Swal.fire({
    icon: 'success',
    title: 'Atualização bem-sucedida!',
    text: 'Seu perfil foi atualizado com sucesso.',
    confirmButtonText: 'OK'
  }).then(() => {
    window.location.href = '/user-profile'; // Redireciona após a confirmação
  });
}

// Função para mostrar alerta de erro
function showErrorAlert(message) {
  Swal.fire({
    icon: 'error',
    title: 'Erro ao atualizar perfil',
    text: message,
    confirmButtonText: 'OK'
  });
}
