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

// Função para manipular o login
const loginForm = document.querySelector('.form-login');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita o envio padrão do formulário

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        if (!emailInput || !passwordInput) {
            console.error('Campos de email ou senha não encontrados.');
            alert('Campos de email ou senha não encontrados.');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Verifique se ambos os campos têm valor
        if (!email || !password) {
            alert('Por favor, preencha ambos os campos de email e senha.');
            return;
        }

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })
        .then(response => response.json()) // Espera uma resposta JSON do servidor
        .then(data => {
            console.log('Resposta do servidor:', data); // Adicione um log para depuração

            if (data.success) {
                // Login bem-sucedido
                alert('Login realizado com sucesso!');
                // Redireciona para a página principal após login bem-sucedido
                window.location.href = '/user-profile'; 
            } else {
                // Login falhou, exibe a mensagem de erro
                alert(data.message || 'Email ou senha incorretos.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
        });
    });
} else {
    console.error('Formulário de login não encontrado.');
}

// Função para manipular o registro
const registerForm = document.querySelector('.form-register');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Evita o envio padrão do formulário

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const stateSelect = document.getElementById('state');
        const citySelect = document.getElementById('city');

        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !stateSelect || !citySelect) {
            console.error('Alguns campos do formulário não foram encontrados.');
            alert('Por favor, preencha todos os campos do formulário.');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const state = stateSelect.value;
        const city = citySelect.value;

        if (!name || !email || !password || !confirmPassword || !state || !city) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
                state,
                city,
            }),
        })
        .then(response => response.json()) // Espera uma resposta JSON do servidor
        .then(data => {
            console.log('Resposta do servidor:', data); // Adicione um log para depuração

            if (data.success) {
                // Registro bem-sucedido
                alert(data.message); // Mensagem do servidor
                window.location.href = '/'; // Redireciona para a página de login
            } else {
                // Registro falhou, exibe a mensagem de erro
                alert(data.message || 'Ocorreu um erro ao registrar a conta.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao fazer o registro. Por favor, tente novamente.');
        });
    });
} else {
    console.error('Formulário de registro não encontrado.');
}
