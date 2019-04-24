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

async function renderRecipes() {
    const recipes = await getBase('/recipes?_sort=id&_order=desc');
    const limitRecipes = recipes.slice(0, 8);
    (async () => await _render_one_recipe(limitRecipes, '.recipes-container'))();
};

async function renderAllRecipes() {
    $('.content').html(`<h1 class="recipes-click-scroll">Vrhunski recepti - baza recepata:</h1><div class="recipes-container"></div>`);
    const recipesAll = await getBase('/recipes');
    (async () => await _render_one_recipe(recipesAll, '.recipes-container'))();
    animateFocus('.recipes-click-scroll');
};

async function _render_one_recipe(recipes, location) {
    for (const rec of recipes) {
        const $recipeContainer = $(`${location}`);
        const $recipe = $(`<div class="recipes" id="${rec.id}">
                    <div class="recipes-descr fav">
                        <h3>Datum objave: ${(rec.recipeCreated).slice(0, 10)}<i title="Podeli sa drugima" class="fas fa-share-alt fa-lg"></i>
                        <span id="fav_${rec.id}"><i title="Dodaj u omiljene" class="far fa-heart fa-lg offHeart"></i></span>
                        </h3>
                    </div>
                    <img src="${rec.imgUrl[0] == undefined ? './img/image-not-found.jpg' : rec.imgUrl[0]}" alt="recept" class="image_${rec.id}"><br>
                    <div class="recipe-info">
                        <h3 class="recipes-ctgr">${rec.category}</h3>
                        <h2 class="recipes-descr" id="recipes-height">${rec.title}</h2><br>
                        <hr>
                        <h3 class="recipes-descr"><i class="fas fa-stopwatch fa-lg"></i>&nbsp;${rec.timePrep}&nbsp;min&nbsp;&nbsp;&nbsp;
                        <i class="fas fa-utensils fa-lg"></i>&nbsp;${rec.preparation}</h3>
                    </div>
                </div>`);
        $recipe.appendTo($recipeContainer);
    }
};

function animateFocus(toLocation) {
    $('html, body').animate({ scrollTop: $(`${toLocation}`).offset().top }, 800);
};

function advancedSearch() {
    $('.show').slideToggle(800);
    animateFocus('#aSearch');
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

async function postIntoDatabase(location, obj, message) {
    return await api.post(`/${location}`, obj)
        .then((response) => alert(`${message}`))
        .catch((error) => {
            alert(error);
        });
};

function createUser() {
    const usersObj = {};
    $("#writeRecipe").find("input, select, textarea").each(function () {
        usersObj[this.name] = $(this).val();
    });
    delete usersObj.passwordRepeat;
    usersObj['favorites'] = [];

    const message = 'Uspesno ste se registrovali';
    (async () => await postIntoDatabase('users', usersObj, message))();
    setTimeout(() => {location.href = 'index.html';}, 500);
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

function goToUserPanel() {
    if (localStorage.getItem('validation')) {
        location.href = 'user_panel.html';
    } else {
        alert('Da bi koristili korisnički panel, morate biti ulogovani!');
    }
};

function checkUserLogIn() {
    return localStorage.getItem('validation') ? location.href = 'add_recipe.html' :
        alert('Da bi dodali vaš kulinarski recept, morate biti ulogovani!');
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

function onLoadPageHTML() {
    const page = location.href;
    if (page.search('/index.html') >= 0) {
        return renderRecipes();
    }
};

function eventsAll() {
    $('#recipes_showAll').on('click', renderAllRecipes);
    $('#aSearch, #closeSearch').on('click', advancedSearch);
    $('.item4 button').on('click', checkUserLogIn);
    $('#userPanel').on('click', goToUserPanel);
    $('#logIn').on('click', userLogIn);
    $('#createUser').on('click', createUser);
    $('#logIn-out').on('click', logInOut);
    $('#home').on('click', () => animateFocus('#home'));
};

$(document).on('load', onLoadPageHTML(), addLogOut(), eventsAll(), animationsAll());
