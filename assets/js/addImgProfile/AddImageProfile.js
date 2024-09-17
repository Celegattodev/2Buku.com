const inputFile = document.querySelector('#profile-image');
const pictureImage = document.querySelector('.picture-image');
const picImageText = "Carregue uma imagem";

pictureImage.innerHTML = picImageText;

inputFile.addEventListener('change', function (e) {
    const inputTarget = e.target;
    const file = inputTarget.files[0];

    if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', function (e) {
            const readerTarget = e.target;
            const img = document.createElement('img');
            img.src = readerTarget.result;
            img.classList.add('picture-img', 'img-fluid');
            img.style.width = "150px";
            img.style.height = "150px";
            img.style.borderRadius = "50%";
            img.style.objectFit = "cover";
            img.style.zIndex = "1"; // Garantir que a imagem esteja visível na frente de outros elementos

            pictureImage.innerHTML = ''; // Limpa qualquer conteúdo anterior
            pictureImage.appendChild(img);
        });
        reader.readAsDataURL(file);
    } else {
        pictureImage.innerHTML = picImageText;
    }
});
