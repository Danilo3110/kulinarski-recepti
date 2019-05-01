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
    const limitRecipes = recipes.slice(0, 11);
    (async () => await _render_one_recipe(limitRecipes, '.recipes-container'))();
};

async function renderAllRecipes(title, query) {
    $('.content').html(`<h1 class="recipes-click-scroll">${title}</h1><div class="recipes-container"></div>`);
    const recipesAll = await getBase(`/recipes${query}`);
    (async () => await _render_one_recipe(recipesAll, '.recipes-container'))();
    animateFocus('.recipes-click-scroll');
    loadFavorites();
};

async function _render_one_recipe(recipes, location) {
    for (const rec of recipes) {
        const $recipeContainer = $(`${location}`);
        const $recipe = $(`<div class="recipes" id="${rec.id}">
                    <div class="recipes-descr fav">
                        <h3>Datum objave: ${(rec.recipeCreated).slice(0, 10)}
                        <span id="share_${rec.id}"><i title="Podeli sa drugima" class="fas fa-share-alt fa-lg"></i></span>
                        <span id="fav_${rec.id}"><i title="Dodaj u omiljene" class="far fa-heart fa-lg offHeart"></i></span>
                        </h3>
                    </div>
                    <img src="${rec.imgUrl[0] == undefined ? './img/image-not-found.jpg' : rec.imgUrl[0]}" alt="recept" class="image_${rec.id}" title="${rec.title}"><br>
                    <div class="recipe-info">
                        <h3 class="recipes-ctgr">${rec.category}</h3>
                        <h2 class="recipes-descr" id="recipes-height">${rec.title}</h2>
                        <hr>
                        <h3 class="recipes-descr"><i class="fas fa-stopwatch fa-lg"></i>&nbsp;${rec.timePrep}&nbsp;min&nbsp;&nbsp;
                        <i class="fas fa-tachometer-alt fa-lg"></i>&nbsp;${rec.preparation}
                        <span id="person"><i class="fas fa-utensils fa-lg"></i>&nbsp;${rec.personNumber === null ? '' : rec.personNumber}</span></h3>
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
    const $ingradient = $(`<input type="text" name="qty_${count}" class="input_${count}" placeholder="Upišite&nbsp;meru">
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

async function renderFullRecipe() {
    const idOfCardRecipe = JSON.parse(sessionStorage.getItem('idOfCardRecipe'));
    const responseRecipes = await api.get(`/recipes/${idOfCardRecipe}`);
    if (responseRecipes.status < 400) {
        const recipes = responseRecipes.data;
        const users = await getBase(`/users/${recipes.authorId}`);

        $('html head').find('title').text(`${recipes.title}`);
        const $fullContainer = $('.content');
        const $recipe = $(`<h2>${recipes.title}</h2>
            <h4 class="catgr-title">Kategorija: ${recipes.category}</h4>
            <div class="single-recipe-container">
            <div class="single-recipe-img"></div>
            <div class="single-recipe-data">
                <div>
                    <h5>Kuhinja: ${recipes.kitchen}</h5>
                    Težina pripreme: ${recipes.preparation}<br><br>
                    Broj osoba: <i class="fas fa-male fa-lg">&nbsp;${recipes.personNumber === null ? '' : recipes.personNumber}</i><br><br>
                    Vreme pripreme: <div class="numStep">${recipes.timePrep}</div>minuta<br><br>
                    Posno:&nbsp;${recipes.posno === true ? 'DA': 'NE'}<br><br>
                    ${recipes.vegetarijanski === true ? '<img src="./img/vegeterian.png" class="vegeterian">': ''}<br>
                </div>
            </div>
            <div class="single-recipe-userData">
                <h5>Šifra recepta: ${recipes.recipeNumber}</h5>
                Objavljen: ${recipes.recipeCreated}<br><br>
                Proveren: ${recipes.recipeChecked}<hr>
                <h4>Autor: ${users.name}</h4>
                Mesto: ${users.city}<br><br>
                Zanimanje: ${users.work === '' ? '/' : users.work}<br><br>
                <button type="submit" id="showUserRecipes">Recepti&nbsp;autora</button><br><br>
                <i class="fas fa-print fa-lg" title="Odštampaj recept"></i>
                <span id="fav_${recipes.id}"><i class="far fa-heart fa-lg offHeart" title="Dodaj u omiljene"></i></span>
                <span id="share_${recipes.id}"><i title="Podeli sa drugima" class="fas fa-share-alt fa-lg"></i></span>
            </div>
            <hr>
            <div class="single-recipe-detailed">
                <h3>Opis</h3>
                <div>${recipes.recipeInfo}</div><br>
            </div>
            <hr>
            <div class="single-recipe-ingredients">
                <h3>Potrebni&nbsp;sastojci</h3>
                <table class="ingredients"></table><br>
            </div><hr>
            <div class="single-recipe-steps">
                <h3>Priprema&nbsp;jela</h3>
                <ol class="steps"></ol>
            </div><hr>
            <div class="single-recipe-advice">
                <h3>Saveti</h3>
                <ol class="advice"><li><i class="far fa-lightbulb fa-2x"></i>&nbsp;${recipes.advice === '' ? 'Prijatno!' : recipes.advice}</li></ol>
            </div><hr>
            </div>`);
        $recipe.appendTo($fullContainer);
        if ((recipes.imgUrl).length != 0) {
            recipes.imgUrl.forEach(function (image, index) {
                $('.single-recipe-img').append(`<img src="${image}" alt="slika${index}">`);
            });
        } else {
            $('.single-recipe-img').append(`<img src="./img/image-not-found.jpg" alt="nema slike">`);
        }
        for (let i = 1; i <= recipes.ingredients; i++) {
            const qty = 'qty_' + i;
            const ingredient = 'ingredient_' + i;
            $('.ingredients').append(`<tr><td><strong>${recipes[qty] === '' ? 'po želji' : recipes[qty]}</strong></td><td>-&nbsp;${recipes[ingredient]}</td></tr>`);
        }
        for (let i = 1; i <= recipes.steps; i++) {
            const step = 'step_' + i;
            $('.steps').append(`<li><div class="numStep">${i}.</div>${recipes[step]}</li>`);
        }
        animateFocus('.category');
        $('.fa-print').on('click', printRecipe);
        $(`#fav_${recipes.id}`).on('click', addToFavorites);
        $(`#showUserRecipes`).on('click', async () => await renderAllRecipes(`Svi recepti korisnika - ${users.name}:`, `?authorId=${users.id}`));
    }
};

async function postIntoDatabase(location, obj, message) {
    return await api.post(`/${location}`, obj)
        .then((response) => alert(`${message}`))
        .catch((error) => {
            alert(error);
        });
};

const valid = {};
function validationCheck() {
    let input = event.currentTarget.name;
    const RegEx = {
        name: /^[A-ZŠĐŽČĆ][a-zšđžčć]{2,}\s[A-ZŠĐŽČĆ][a-zšđžčć]+$/,
        email: /^[a-z][a-z.-\d]+[@][a-z]{3,}.[a-z]{2,3}$/,
        password: /^(?=[A-Za-z_]+\d)\w{8,}$/,
        work: /^[A-ZŠĐŽČĆ][a-zšđžčć]{3,}\s?[A-ZŠĐŽČĆa-zšđžčć]+/,
        telephone: /^\d{3}\/(\d{2,3}-?\d{2,3}-?\d{2,}|\d{3,4}-?\d{3,4})$/
    };
    const passwordRepeat = $('#password').val() === $('#passwordRepeat').val();
    const city = $('#city').val() === null ? false : true;

    if (input !== 'passwordRepeat') {
        let inputValue = event.currentTarget.value;
        if (RegEx[input].test(inputValue)) {
            $(`.${input}`).html(`<i class="fas fa-check-circle"></i>`).css('color', 'green');
            valid[input] = true;
        } else {
            $(`.${input}`).html(`<i class="fas fa-times-circle"></i>`).css('color', 'rgb(181, 68, 132)');
            valid[input] = false;
        }
    } else {
        if (passwordRepeat) {
            $(`.${input}`).html(`<i class="fas fa-check-circle"></i>`).css('color', 'green');
            valid[input] = true;
        } else {
            $(`.${input}`).html(`<i class="fas fa-times-circle"></i>`).css('color', 'rgb(181, 68, 132)');
            valid[input] = false;
        }
    }
    if (city) {
        $(`.city`).html(`<i class="fas fa-check-circle"></i>`).css('color', 'green');
        valid['city'] = true;
    } else {
        $(`.city`).html(`<i class="fas fa-times-circle"></i>`).css('color', 'rgb(181, 68, 132)');
        valid['city'] = false;
    }
};

function createUser() {
    if (valid.name && valid.email && valid.password && valid.work && valid.telephone && valid.passwordRepeat && valid.city) {
        const usersObj = {};
        $("#writeRecipe").find("input, select, textarea").each(function () {
            usersObj[this.name] = $(this).val();
        });
        delete usersObj.passwordRepeat;
        usersObj['favorites'] = [];

        const message = 'Uspesno ste se registrovali';
        (async () => await postIntoDatabase('users', usersObj, message))();
        setTimeout(() => { location.href = 'index.html'; }, 500);
    } else {
        alert('Nevalidan unos!\nMolimo Vas, popunite sva tražena polja.');
    }
};

function createRecipe(methodPost = true) {
    const recipesObj = {};
    const option = [];
    const imgUrls = [];

    if (methodPost) {
        const currentDate = new Date();
        const recipeCreated = currentDate.toLocaleString('sr-RS');
        const randomCheckingTime = Math.floor(Math.random() * Math.floor(24));
        const recipeChecked = new Date(currentDate.setHours(currentDate.getHours() + randomCheckingTime)).toLocaleString('sr-RS');
        recipesObj['recipeCreated'] = recipeCreated;
        recipesObj['recipeChecked'] = recipeChecked;

        const recipeNumber = Math.floor(Math.random() * 999);
        recipesObj['recipeNumber'] = recipeNumber;
    }
    recipesObj['authorId'] = JSON.parse(localStorage.getItem('id'));

    $('#writeRecipe').find('input:not(:checkbox), textarea, select').each(function () {
        recipesObj[this.name] = $(this).val();
    });
    $('#writeRecipe').find('input[type="number"]').each(function () {
        recipesObj[this.name] = Number($(this).val());
    });
    $('#writeRecipe').find(':checkbox').each(function () {
        if ($(this).is(':checked')) {
            recipesObj[this.id] = true;
            option.push(this.value);
            recipesObj['options'] = option.join(', ');
        } else {
            recipesObj[this.id] = false;
        }
    });
    recipesObj['ingredients'] = Number(($('.form-right-1').children('input').last().attr('class')).slice(6, ));
    recipesObj['steps'] = Number(($('.form-right-2').children('textarea').last().attr('class')).slice(9, ));

    if (methodPost) {
        const files = $("#imgUrl")[0].files;
        for (const i of files) {
            imgUrls.push('img/' + i.name);
            recipesObj.imgUrl = imgUrls;
        }
        const message = 'Uspešno ste objavili novi kulinarski recept';
        (async () => {await postIntoDatabase('recipes', recipesObj, message); await (location.href = 'user_panel.html');})();
    } else return recipesObj;
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
                    <button class="deleteRecipe" type="submit">Obriši&nbsp;recept</button><br>`);
    $('.editRecipe').on('click', startEditRecipe);
    $('.deleteRecipe').on('click', () => deleteRecipes('Uspesno ste obrisali vaš kulinarski recept!'));
    $('#showFavorites').on('click', () => renderFavorites());
};

async function startEditRecipe() {
    const recipe = event.currentTarget.parentElement.id;
    const editRecipe = await getBase(`/recipes/${recipe}`);
    delete editRecipe.options;
    sessionStorage.setItem('recipeForEdit', JSON.stringify(editRecipe));
    sessionStorage.setItem('recipeCheckLoadValidity', true);
    sessionStorage.setItem('recipeId', recipe);
    location.href = 'add_recipe.html';
};

function getRecipeForEditFromSStorage() {
    $('#imgUrl').remove();
    $('h5').remove();
    const recipe = JSON.parse(sessionStorage.getItem('recipeForEdit'));
    for (let i = 3; i <= recipe.ingredients; i++) {
        addIngredient();
    }
    for (let i = 3; i <= recipe.steps; i++) {
        addStep();
    }
    $('#writeRecipe').find(':checkbox').each(function () {
        if (recipe[this.id] === true) {
            this.checked = true;
        }
    });
    function populate(form, data) {
        $.each(data, function (key, value) {
            $(`[name = ${key}]`, form).val(value);
        });
    };
    populate('#writeRecipe', recipe);
    sessionStorage.removeItem('recipeCheckLoadValidity');
    sessionStorage.removeItem('recipeForEdit');
    $('.content h2').html('Izmena recepta');
    $('#createRecipe').remove();
    $('button[type=reset]').after(`&nbsp;&nbsp;&nbsp;<button type="button" id="modifyRecipe">Sačuvaj&nbsp;izmene</button>`);
    $('#modifyRecipe').on('click', patch_Recipe);
};

function loadRecipeToForm() {
    if (JSON.parse(sessionStorage.getItem('recipeCheckLoadValidity'))) {
        $('html head').find('title').text(`Izmena recepta`);
        getRecipeForEditFromSStorage();
    };
};

async function patch_Recipe() {
    const editedRecipe = createRecipe(false);
    await api.patch(`/recipes/${sessionStorage.getItem('recipeId')}`, editedRecipe)
        .then((response) => alert(`Uspešno ste izmenili vaš recept!`))
        .catch((error) => alert(error));
    sessionStorage.removeItem('recipeId');
    location.href = 'user_panel.html';
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

async function categoryButtons() {
    let index = 1;
    const categories = ['Hladna predjela', 'Salate', 'Glavna jela', 'Torte'];
    for (const cat of categories) {
        let recipes = await getBase(`/recipes?category=${cat}`);
        $(`#cook${index}`).children('h6').html(`Novi&nbsp;recepti: ${recipes.length == undefined ? 0 : recipes.length}`);
        $(`#cook${index}`).on('click', async () => await renderAllRecipes(`${cat.toUpperCase()}:`, `?category=${cat}&_sort=id&_order=desc`));
        index++;
    }
};

function printRecipe() {
    const restorepage = $('body').html();
    const printcontent = $('#content').clone();
    $('body').empty().html(printcontent);
    print();
    $('body').html(restorepage);
};

function onLoadPageHTML() {
    const page = location.href;
    if (page.search('/index.html') >= 0) {
        return renderRecipes();
    } else if (page.search('/recipe.html') >= 0) {
        return renderFullRecipe();
    } else if (page.search('/add_recipe.html') >= 0) {
        return loadRecipeToForm();
    } else if (page.search('/user_panel.html') >= 0) {
        return usersRecipes();
    } else if (page.search('/register.html') >=0){
        return $('#writeRecipe input').on('input', validationCheck);
    }
};

function eventsAll() {
    $('#recipes_showAll').on('click', async () => await renderAllRecipes('Vrhunski recepti - baza recepata:', ''));
    $('#aSearch, #closeSearch').on('click', advancedSearch);
    $('.item4 button').on('click', checkUserLogIn);
    $('#userPanel').on('click', goToUserPanel);
    $('#logIn').on('click', userLogIn);
    $('#createUser').on('click', createUser);
    $('#resetUser').on('click', () => location.reload());
    $('#logIn-out').on('click', logInOut);
    $('#createRecipe').on('click', () => createRecipe());
    $('#searchRecipesAll, #searchRecipesAll_2').on('click', async () => await searchRecipes('.recipes-container', '.recipes-click-scroll'));
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
