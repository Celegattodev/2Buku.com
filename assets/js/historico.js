document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/user-exchanges')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const exchanges = data.exchanges;
        const listGroup = document.querySelector('.list-group');
        listGroup.innerHTML = ''; // Limpa a lista existente

        exchanges.forEach(exchange => {
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item');
          listItem.id = 'item-history';

          const exchangeStatus = getExchangeStatus(exchange.status);
          const exchangeDate = new Date(exchange.data_solicitacao).toLocaleDateString('pt-BR'); // Certifique-se de usar o campo correto

          let exchangeDescription;
          let otherUserName;
          if (exchange.usuario_solicitante_id === data.currentUserId) {
            otherUserName = exchange.usuario_recebedor;
            if (exchange.status === 'Pendente') {
              exchangeDescription = `Você ofereceu o livro <b>${exchange.titulo_solicitante}</b> pelo livro <b>${exchange.titulo_recebedor}</b>.`;
            } else {
              exchangeDescription = `Você trocou o livro <b>${exchange.titulo_solicitante}</b> pelo livro <b>${exchange.titulo_recebedor}</b>.`;
            }
          } else {
            otherUserName = exchange.usuario_solicitante;
            exchangeDescription = `Você trocou o livro <b>${exchange.titulo_recebedor}</b> pelo livro <b>${exchange.titulo_solicitante}</b>.`;
          }

          listItem.innerHTML = `
            <div class="col mt-2 d-sm-flex justify-content-between">
              <h5>${exchangeStatus} - ${otherUserName}</h5>
              <p>${exchangeDate}</p>
            </div>
            <p>${exchangeDescription}</p>
          `;

          listGroup.appendChild(listItem);
        });

        // Adiciona funcionalidade de pesquisa por texto
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('input', (event) => {
          const searchTerm = event.target.value.toLowerCase();
          filterExchanges(searchTerm, dateInput.value);
        });

        // Adiciona funcionalidade de pesquisa por data
        const dateInput = document.querySelector('input[type="date"]');
        dateInput.addEventListener('input', (event) => {
          const searchDate = event.target.value;
          filterExchanges(searchInput.value.toLowerCase(), searchDate);
        });

        function filterExchanges(searchTerm, searchDate) {
          const filteredExchanges = exchanges.filter(exchange => {
            const otherUserName = exchange.usuario_solicitante_id === data.currentUserId ? exchange.usuario_recebedor : exchange.usuario_solicitante;
            const exchangeDate = new Date(exchange.data_solicitacao).toISOString().split('T')[0]; // Formato YYYY-MM-DD

            const matchesSearchTerm = searchTerm ? (
              exchange.titulo_solicitante.toLowerCase().includes(searchTerm) ||
              exchange.titulo_recebedor.toLowerCase().includes(searchTerm) ||
              otherUserName.toLowerCase().includes(searchTerm)
            ) : true;

            const matchesSearchDate = searchDate ? (
              exchangeDate === searchDate
            ) : true;

            return matchesSearchTerm && matchesSearchDate;
          });

          listGroup.innerHTML = ''; // Limpa a lista existente
          filteredExchanges.forEach(exchange => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            listItem.id = 'item-history';

            const exchangeStatus = getExchangeStatus(exchange.status);
            const exchangeDate = new Date(exchange.data_solicitacao).toLocaleDateString('pt-BR'); // Certifique-se de usar o campo correto

            let exchangeDescription;
            let otherUserName;
            if (exchange.usuario_solicitante_id === data.currentUserId) {
              otherUserName = exchange.usuario_recebedor;
              if (exchange.status === 'Pendente') {
                exchangeDescription = `Você ofereceu o livro <b>${exchange.titulo_solicitante}</b> pelo livro <b>${exchange.titulo_recebedor}</b>.`;
              } else {
                exchangeDescription = `Você trocou o livro <b>${exchange.titulo_solicitante}</b> pelo livro <b>${exchange.titulo_recebedor}</b>.`;
              }
            } else {
              otherUserName = exchange.usuario_solicitante;
              exchangeDescription = `Você trocou o livro <b>${exchange.titulo_recebedor}</b> pelo livro <b>${exchange.titulo_solicitante}</b>.`;
            }

            listItem.innerHTML = `
              <div class="col mt-2 d-sm-flex justify-content-between">
                <h5>${exchangeStatus} - ${otherUserName}</h5>
                <p>${exchangeDate}</p>
              </div>
              <p>${exchangeDescription}</p>
            `;

            listGroup.appendChild(listItem);
          });
        }
      } else {
        console.error('Erro ao buscar trocas do usuário:', data.message);
      }
    })
    .catch(error => {
      console.error('Erro ao fazer requisição para buscar trocas do usuário:', error);
    });
});

function getExchangeStatus(status) {
  switch (status) {
    case 'Pendente':
      return 'Troca em andamento';
    case 'Aceito':
      return 'Troca aceita';
    case 'Recusada':
      return 'Troca recusada';
    default:
      return 'Status desconhecido';
  }
}

// Adiciona funcionalidade de filtro por checkbox
const checkboxes = document.querySelectorAll('.checkbox-troca');
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    filterExchanges(searchInput.value.toLowerCase(), dateInput.value, getSelectedStatuses());
  });
});

function getSelectedStatuses() {
  const selectedStatuses = [];
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedStatuses.push(checkbox.nextElementSibling.textContent.trim());
    }
  });
  return selectedStatuses;
} 