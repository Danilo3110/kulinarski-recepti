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
    loadFavorites();
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
                    <img src="${rec.imgUrl[0] == undefined ? './img/image-not-found.jpg' : rec.imgUrl[0]}" alt="recept" class="image_${rec.id}" title="${rec.title}"><br>
                    <div class="recipe-info">
                        <h3 class="recipes-ctgr">${rec.category}</h3>
                        <h2 class="recipes-descr" id="recipes-height">${rec.title}</h2><br>
                        <hr>
                        <h3 class="recipes-descr"><i class="fas fa-stopwatch fa-lg"></i>&nbsp;${rec.timePrep}&nbsp;min&nbsp;&nbsp;&nbsp;
                        <i class="fas fa-utensils fa-lg"></i>&nbsp;${rec.preparation}</h3>
                    </div>
                </div>`);
        $recipe.appendTo($recipeContainer);
        $(`.image_${rec.id}`).on('click', () => fullRecipes(rec.id));
        $(`#fav_${rec.id}`).on('click', addToFavorites);
    }
};

function fullRecipes(id) {
    sessionStorage.setItem('idOfCardRecipe', id);
    window.open('recipe.html', '', '');
};

const fav = {favorites: []};
async function addToFavorites() {
    const iconId = event.currentTarget.id;
    const recipeId = Number(iconId.slice(4, ));
    if (localStorage.getItem('validation')) {
        if ($(`#${iconId} i`).hasClass('offHeart')) {
            $(`#${iconId}`).html(`<i title="Dodato u omiljene" class="fas fa-heart fa-lg onHeart"></i>`);
            fav['favorites'].push(recipeId);
            await api.patch(`/users/${localStorage.getItem('id')}`, fav);
        } else {
            $(`#${iconId}`).html(`<i title="Dodaj u omiljene" class="far fa-heart fa-lg offHeart"></i>`);
            const index = fav.favorites.indexOf(recipeId);
            fav['favorites'].splice(index, 1);
            await api.patch(`/users/${localStorage.getItem('id')}`, fav);
        }
    }
};

async function favorites() {
    if (localStorage.getItem('validation')) {
        const user = await getBase(`/users/${localStorage.getItem('id')}`);
        const favorites = user.favorites;
        fav['favorites'] = favorites;
    }
};

function loadFavorites() {
    setTimeout(() => {
        const recipesId = fav['favorites'];
        if (localStorage.getItem('validation') && (recipesId !== undefined)) {
            for (const rec of recipesId) {
                $(`#fav_${rec}`).html(`<i title="Dodato u omiljene" class="fas fa-heart fa-lg onHeart"></i>`);
            }
        }}, 400);
};

async function renderFavorites() {
    const user = await getBase(`/users/${localStorage.getItem('id')}`);
    const recipesId = user.favorites;
    if (recipesId.length > 0) {
        let queryForRender = '';
        for (const rec of recipesId) {
            queryForRender += `id=${rec}&`;
        }
        $('.content').html(`<h1 class="recipes-click-scroll">Korisnik: ${localStorage.getItem('user')} - Omiljeni recepti:</h1>
                            <div class="user-container"></div>`);
        const recipesForRender = await getBase(`/recipes/?${queryForRender}`);
        (async () => await _render_one_recipe(recipesForRender, '.user-container'))();
        animateFocus('.content');
        loadFavorites();
    } else {
        alert('Nemate dodate omiljene kulinarske recepte');
    }
};

function addIngredient() {
    let previous = ($('.form-right-1').children('input').last().attr('class')).slice(6, );
    const count = Number(previous) + 1;
    const $ingradient = $(`<input type="number" name="qty_${count}" class="input_${count}" placeholder="Upišite&nbsp;meru">
                        <input type="text" name="ingredient_${count}" class="input_${count}" placeholder="Naziv&nbsp;sastojka_${count}"><br>`);
    $ingradient.appendTo($('.form-right-1'));
};

function addStep() {
    let previous = ($('.form-right-2').children('textarea').last().attr('class')).slice(9, );
    const count = Number(previous) + 1;
    const $step = $(`<textarea name="step_${count}" cols="50" rows="3" class="textarea_${count}" placeholder="Korak ${count}"></textarea><br>`);
    $step.appendTo($('.form-right-2'));
};

function deleteFields(location, field) {
    let toClean = $(location).children(field).last().attr('class');
    if (toClean !== `${field}_2`) {
        $(`.${toClean}`).remove();
        $(location).children('br').last().remove();
    }
};

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
    setTimeout(() => { location.href = 'index.html'; }, 500);
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

async function usersRecipes() {
    const userRecipes = await getBase(`/recipes?authorId=${localStorage.getItem('id')}`);
    $('.content').append(`<h1 class="recipes-click-scroll">Korisnik: ${localStorage.getItem('user')} - recepti:</h1>
                        <div class="user-container"></div>`);
    await _render_one_recipe(userRecipes, '.user-container');
    animateFocus('.content');
    $('.recipes').append(`<button class="editRecipe" type="submit">Izmeni&nbsp;recept</button>
                    <button class="deleteRecipe" type="submit">Obriši&nbsp;recept</button><br>`)
    $('.deleteRecipe').on('click', () => deleteRecipes('Uspesno ste obrisali vaš kulinarski recept!'));
    $('#showFavorites').on('click', () => renderFavorites());
};

async function deleteRecipes(message) {
    const recipe = event.currentTarget.parentElement.id;
    if (confirm('Da li ste sigurni da želite da obrisete odabrani recept ?')) {
        return await api.delete(`/recipes/${recipe}`)
            .then((response) => { alert(`${message}`); location.reload(); })
            .catch((error) => { alert(error); });
    }
};

async function searchRecipes(location, animation) {
    const inputsAll = {};
    $('#advancedSearch, #basicSearch').find('input:not(:checkbox), select').each(function () {
        if (this.value !== '') {
            inputsAll[this.id] = this.value;
        }
    });
    $('#advancedSearch').find('input:checked').each(function () {
        inputsAll[this.id] = this.checked;
    });
    const response = await api.get(`/recipes`, {params: inputsAll});
    const recipesFiltered = response.data;

    $(location).html('');
    $(animation).html('Rezultati pretrage:');
    animateFocus(animation);
    (async () => await _render_one_recipe(recipesFiltered, `${location}`))();
    loadFavorites();
};

async function categoryButtons(){
    let index = 1;
    const categorys = ['Hladna predjela', 'Salate', 'Glavna jela', 'Torte'];
    for(const cat of categorys){
        let recipes = await getBase(`/recipes?category=${cat}`);
        $(`#cook${index}`).children('h6').html(`Novi&nbsp;recepti: ${recipes.length == undefined ? 0 : recipes.length}`);
        $(`#cook${index}`).on('click', () => categoryShow(`/recipes?category=${cat}`, cat));
        index++;
    }
};

async function categoryShow(querry, category){
    const recipes = await getBase(`${querry}&_sort=id&_order=desc`);
    $('.content').html(`<h1 class="recipes-click-scroll">${category.toUpperCase()}:</h1><div class="recipes-container"></div>`);
    (async () => await _render_one_recipe(recipes, '.recipes-container'))();
    animateFocus('#cook4');
    loadFavorites();
};

function onLoadPageHTML() {
    const page = location.href;
    if (page.search('/index.html') >= 0) {
        return renderRecipes();
    } else if (page.search('/user_panel.html') >= 0) {
        return usersRecipes();
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
    $('#searchRecipesAll, #searchRecipesAll_2').on('click', () => searchRecipes('.recipes-container', '.recipes-click-scroll'));
    $('#rec_searchRecipesAll, #rec_searchRecipesAll_2').on('click', () => {
        $('.content').html(`<h1 class="recipes-click-scroll"></h1>
                            <div class="user-container"></div>`);
        searchRecipes('.user-container', '.recipes-click-scroll');
    });
    $('#home').on('click', () => animateFocus('#home'));
    $('#plus-ingredient').on('click', addIngredient);
    $('#minus-ingredient').on('click', () => deleteFields('.form-right-1', 'input'));
    $('#plus-step').on('click', addStep);
    $('#minus-step').on('click', () => deleteFields('.form-right-2', 'textarea'));
};

$(document).on('load', animateBackground(), onLoadPageHTML(), addLogOut(), categoryButtons(), eventsAll(), animationsAll(), favorites(), loadFavorites());
