const form = document.querySelector("#form")
const inputFile = document.querySelector('#input-file')
const pictureImage = document.querySelector('.picture-image')
const picImageText = "Carregue uma imagem"
const img_book = document.createElement('img')
pictureImage.innerHTML = picImageText

inputFile.addEventListener('change', function(e){
    const inputTarget = e.target
    const file = inputTarget.files[0]

    if(file){
        const reader = new FileReader()
        reader.addEventListener('load', function(e){
            const readerTarget = e.target
            const img = document.createElement('img')
            img.src = readerTarget.result
            img.classList.add('picture-img')
            pictureImage.innerHTML = ''

            pictureImage.appendChild(img)
        })
        reader.readAsDataURL(file)
    }
    else{
        img_book.classList.add('picture-img')
        pictureImage.innerHTML = img_book
    }
})