'use strict';

const loginContainer = document.getElementById('login-container');

// Função para mover a tela de login para a tela de registro e vice-versa
const moveOverlay = () => loginContainer.classList.toggle('move');

document.getElementById('open-register').addEventListener('click', moveOverlay);
document.getElementById('open-login').addEventListener('click', moveOverlay);
document.getElementById('open-register-mobile').addEventListener('click', moveOverlay);
document.getElementById('open-login-mobile').addEventListener('click', moveOverlay);

// Função para carregar os estados em ordem alfabética
const loadStates = async () => {
    const stateSelect = document.getElementById('state');
    if (!stateSelect) {
        console.error('Elemento de seleção de estado não encontrado.');
        return;
    }

    try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (!response.ok) throw new Error('Erro na resposta da API');
        
        const data = await response.json();
        if (data.length === 0) throw new Error('Nenhum estado encontrado');

        // Ordena os estados por nome (em ordem alfabética)
        data.sort((a, b) => a.nome.localeCompare(b.nome));

        data.forEach(state => {
            const option = document.createElement('option');
            option.value = state.sigla;
            option.textContent = state.nome;
            stateSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
    }
};

// Função para carregar as cidades com base no estado selecionado
const loadCities = async (state) => {
    const citySelect = document.getElementById('city');
    if (!citySelect) {
        console.error('Elemento de seleção de cidade não encontrado.');
        return;
    }

    citySelect.innerHTML = '<option value="" disabled selected>Cidade</option>'; // Limpa opções anteriores

    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
        if (!response.ok) throw new Error('Erro na resposta da API');
        
        const data = await response.json();
        if (data.length === 0) throw new Error('Nenhuma cidade encontrada');

        // Ordena as cidades por nome
        data.sort((a, b) => a.nome.localeCompare(b.nome));

        data.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.nome;
            citySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
    }
};

// Carrega os estados ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadStates();
});

// Adiciona um evento de mudança ao campo de estado
const stateSelect = document.getElementById('state');
if (stateSelect) {
    stateSelect.addEventListener('change', (event) => {
        const state = event.target.value;
        if (state) {
            loadCities(state);
        }
    });
}