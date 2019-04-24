'use strict';

const serverUrl = `http://localhost:3000`;
const api = axios.create({
    baseURL: `${serverUrl}`
});
api.defaults.timeout = 4000;

async function getBase(location) {
    const responsFromBase = await api.get(`${location}`);
    return responsFromBase.data;
};

function animateFocus(toLocation) {
    $('html, body').animate({
        scrollTop: $(`${toLocation}`).offset().top}, 800);
};

function advancedSearch() {
    $('.show').slideToggle(800);
    animateFocus('#aSearch');
};

function animationsAll() {
    $(window).scroll(function () {
        $('.container').css({
            "background-position": "0% " + ($(this).scrollTop() / 50) + "px"
        });
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
            $('html, body').animate({
                scrollTop: $('.recipes-click-scroll').offset().top
            }, 850);
        });
    });
};

async function userLogIn() {
    const $email = $('#userEmail').val();
    const $pass = $('#pass').val();
    const usersFromBase = await getBase(`/users`);

    for (const user of usersFromBase) {
        if (user.email === $email && user.password === $pass) {
            localStorage.setItem('validation', true);
            localStorage.setItem('id', user.id);
            localStorage.setItem('user', user.name);
        }
    }
    if (JSON.parse(localStorage.getItem('validation'))) {
        alert(`Uspesno ste se ulogovali!\nDobro došao/la ${localStorage.getItem('user')}`);
        location.href = 'index.html';
    } else {
        $('#userEmail').css('border', '1.5px solid rgb(250, 100, 100)');
        $('#pass').css('border', '1.5px solid rgb(250, 100, 100)');
        $('#alert').html(`Nije dobar unos podataka za login`).css('color', 'rgb(250, 100, 100)');
    }
};

function addLogOut() {
    if (localStorage.getItem('validation')) {
        $('#logIn-out').html(`<i title="Odjavi se" class="fas fa-sign-out-alt fa-lg"></i>`);
    } else {
        $('#logIn-out').html(`<i title="Prijava korisnika" class="fas fa-sign-in-alt fa-lg"></i>`);
    }
};

function logInOut() {
    if (localStorage.getItem('validation')) {
        localStorage.clear();
        sessionStorage.clear();
        addLogOut();
        alert('Uspesno ste se izlogovali!');
        location.href = 'index.html';
    } else {
        $(this).next('#login-content').slideToggle(500);
    }
};

function eventsAll() {
    $('#aSearch, #closeSearch').on('click', advancedSearch);
    $('#logIn').on('click', userLogIn);
    $('#logIn-out').on('click', logInOut);
    $('#home').on('click', () => animateFocus('#home'));
};

$(document).on('load', addLogOut(), eventsAll(), animationsAll());
