document.addEventListener("DOMContentLoaded", function () {
    const productContainers = [...document.querySelectorAll('.product-container')];
    const nxtBtn = [...document.querySelectorAll('.nxt-btn')];
    const preBtn = [...document.querySelectorAll('.pre-btn')];

    const scrollAmount = 800;

    productContainers.forEach((item, i) => {
        let containerWidth = item.getBoundingClientRect().width;

        nxtBtn[i].addEventListener('click', () => {
            item.scrollLeft += scrollAmount;
        })

        preBtn[i].addEventListener('click', () => {
            item.scrollLeft -= scrollAmount;
        })
    })
});


