$(document).ready(function () {
    $('#mobile_btn').on('click', function () {
        $('#mobile_menu').toggleClass('active');

        if ($('#mobile_menu').hasClass('active')) {
            $('#mobile_menu').css('display', 'flex');
            setTimeout(function () {
                $('#mobile_menu').css('opacity', '1');
            }, 10);
        } else {
            $('#mobile_menu').css('opacity', '0');
            setTimeout(function () {
                $('#mobile_menu').css('display', 'none');
            }, 300);
        }
    });
});
