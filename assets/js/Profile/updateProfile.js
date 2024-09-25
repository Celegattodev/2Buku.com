// updateProfile.js

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form');
  const saveButton = document.getElementById('save-edit');

  // Adiciona um listener de evento de submit ao formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Evita o envio padrão do formulário

    // Obtém os dados do formulário
    const formData = new FormData(form);

    // Converte os dados do FormData para um objeto JavaScript
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log('Dados enviados:', data); // Adiciona log para debug

    // Faz a requisição POST para atualizar o perfil
    fetch('/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Perfil atualizado com sucesso!',
            text: 'Suas informações foram salvas.',
            confirmButtonText: 'OK'
          }).then(() => {
            // Verifique a URL de redirecionamento aqui
            window.location.href = '/profile'; // Redireciona para a página de perfil
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao atualizar perfil',
            text: data.message || 'Ocorreu um erro ao atualizar o perfil. Tente novamente mais tarde.',
            confirmButtonText: 'OK'
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao atualizar perfil',
          text: 'Ocorreu um erro ao atualizar o perfil. Tente novamente mais tarde.',
          confirmButtonText: 'OK'
        });
        console.error('Error:', error);
      });
  });

  // Requisição para buscar os dados do perfil
  fetch('/api/profile')
    .then(response => response.json())
    .then(data => {
      if (data) {
        // Preencher os campos com os dados retornados do banco de dados
        document.getElementById('name').value = data.name || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('biography').value = data.biography || '';
      } else {
        console.error('Nenhum dado encontrado');
      }
    })
    .catch(error => {
      console.error('Erro ao carregar os dados do usuário:', error);
    });
});

function cancelEdit() {
  window.location.href = '/profile'; // Redirecionar para a página de perfil ou outra página
}
