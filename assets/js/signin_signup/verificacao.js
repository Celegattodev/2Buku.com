document.getElementById('register-form').addEventListener('submit', function(event) {
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const passwordError = document.getElementById('password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');
  
  // Limpa mensagens anteriores
  passwordError.textContent = '';
  confirmPasswordError.textContent = '';
  
  // Regras de validação de senha
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    event.preventDefault();
  }
  
  if (password !== confirmPassword) {
    event.preventDefault();
    confirmPasswordError.textContent = 'As senhas não coincidem.';
  }
});