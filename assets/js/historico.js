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
            const exchangeDate = new Date(exchange.data_troca).toLocaleDateString('pt-BR');
  
            listItem.innerHTML = `
              <div class="col mt-2 d-sm-flex justify-content-between">
                <h5>${exchangeStatus} - ${exchange.usuario_recebedor}</h5>
                <p>${exchangeDate}</p>
              </div>
              <p>Você trocou o livro <b>${exchange.titulo_solicitante}</b> pelo livro <b>${exchange.titulo_recebedor}</b>.</p>
            `;
  
            listGroup.appendChild(listItem);
          });
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
      case 'em_andamento':
        return 'Troca em andamento';
      case 'cancelada':
        return 'Troca cancelada';
      case 'negada':
        return 'Troca negada';
      case 'realizada':
        return 'Troca realizada';
      case 'contraproposta':
        return 'Contraproposta';
      default:
        return 'Status desconhecido';
    }
  }