document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form');
  const phoneInput = document.getElementById('phone');

  // Adiciona um listener de evento de submit ao formulário
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Evita o envio padrão do formulário

    // Valida o número de telefone
    const phoneValue = phoneInput.value;
    if (phoneValue.length < 9 || phoneValue.length > 11) {
      Swal.fire({
        icon: 'error',
        title: 'Número de telefone inválido',
        text: 'O número de telefone deve ter entre 9 e 11 dígitos.',
        confirmButtonText: 'OK'
      });
      return; // Impede o envio do formulário
    }
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

  // Adiciona um listener de evento de input ao campo de telefone para aceitar somente números
  phoneInput.addEventListener('input', function () {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
  });
});

function cancelEdit() {
  window.location.href = '/profile'; // Redirecionar para a página de perfil ou outra página
}