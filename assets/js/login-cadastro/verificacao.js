function validateRegisterForm() {
  var password = document.getElementById("register-password").value;
  var confirmPassword = document.getElementById("confirm-password").value;
  var passwordError = document.getElementById("password-error");
  var confirmPasswordError = document.getElementById("confirm-password-error");

  var passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  var isValid = true;

  // Limpar mensagens de erro
  passwordError.textContent = "";
  confirmPasswordError.textContent = "";

  if (!passwordRegex.test(password)) {
    passwordError.textContent =
      "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.";
    isValid = false;
  }

  if (password !== confirmPassword) {
    confirmPasswordError.textContent = "As senhas não coincidem.";
    isValid = false;
  }

  return isValid; // Permite o envio do formulário se tudo estiver correto
}
