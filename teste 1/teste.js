const multipleItemCarousel = document.querySelector ('#carouselExampleControls')

if (window.matchMedia("(min-width: 576px").matches){
    const carousel = new bootstrap.Carousel(multipleItemCarousel, {
        interval: false
    })

    var carouselWidth = $('.carousel-inner')[0].scrolWidth;
    var cardWidth = $('.carousel-item').width();

    var scrolPostition = 0;

    $('.carousel-control-next').on('click', function(){
        console.log('next');
        if(scrollPosition < (carouseWidth - (cardWidth * 4))){
            scrollPosition = scrollPosition + cardWidth;
            $('.carousel-inner').animate({scrollLeft: scrollPosition},600);
        }
    });
    $('.carousel-control-prev').on('click', function(){
        if(scrollPosition > 0){
            scrollPosition = scrollPosition - cardWidth;
            $('.carousel-inner').animate({scrollLeft: scrollPosition},600);
        }
    });
}else{

}