import $ from 'jquery';
'use strict';

function animateFocus(toLocation) {
    $('html, body').animate({ scrollTop: $(`${toLocation}`).offset().top }, 800);
};

function advancedSearch() {
    $('.show').slideToggle(800);
    animateFocus('#aSearch');
};

function animateBackground() {
    const backgrounds = ['url(../src/img/cover1.jpg)', 'url(../src/img/cover2.jpg)', 'url(../src/img/cover5.jpg)', 'url(../src/img/cover6.jpg)', 'url(../src/img/cover3.jpg)'];
    let index = 0;

    setInterval(function () {
        index++;
        if (index === backgrounds.length) {
            index = 0;
        }
        $('.container').css('background-image', backgrounds[index]);
    }, 8000);
};

function animationsAll() {
    $(window).scroll(function () {
        $('.container').css({ "background-position": "0% " + ($(this).scrollTop() / 50) + "px" });
    });
    $(document).ready(() => {
        $(window).scroll(() => {
            return $(window).scrollTop() > 100 ?
                $('.logo, .menu, .login, .item4').css('background', 'rgba(55, 66, 82, 0.95)') :
                $('.logo, .menu, .login, .item4').css('background', 'rgba(55, 66, 82, 0.7)');
        });
    });
    $(document).ready(() => {
        $('.recipes-click-scroll').on('click', () => {
            $('html, body').animate({ scrollTop: $('.recipes-click-scroll').offset().top }, 850);
        });
    });
};

export {animateFocus, advancedSearch, animateBackground, animationsAll};
