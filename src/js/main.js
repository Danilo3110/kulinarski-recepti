import '../css/main.css';
import '@babel/polyfill';
import $ from 'jquery';
import axios from 'axios';
import {userLogIn, goToUserPanel, checkUserLogIn, addLogOut, logInOut} from './log_in';
import {validationCheck, createUser} from './register';
import {renderFullRecipe} from './recipe';
import {createRecipe} from './add_recipe';
import {usersRecipes} from './user_panel';
import {addIngredient, addStep, deleteFields, loadRecipeToForm} from './edit_recipe';
'use strict';

const serverUrl = `http://localhost:3000`;
const api = axios.create({baseURL: `${serverUrl}`});
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
                        <span id="fav_${rec.id}"><i title="Dodaj u omiljene" class="far fa-heart fa-lg offHeart"></i></span>
                        <span><i title="Broj pregleda" class="far fa-eye fa-lg">&nbsp;${rec.views}</i></span>
                        </h3>
                    </div>
                    <img src="${rec.imgUrl === '' ? './img/image-not-found.jpg' : rec.imgUrl}" alt="recept" class="image_${rec.id}" title="${rec.title}"><br>
                    <div class="recipe-info">
                        <h3 class="recipes-ctgr">${rec.category === null ? '' : rec.category}</h3>
                        <h2 class="recipes-descr recipes-height">${rec.title}</h2>
                        <hr>
                        <h3 class="recipes-descr"><i class="fas fa-stopwatch fa-lg"></i>&nbsp;${rec.timePrep}&nbsp;min&nbsp;&nbsp;
                        <i class="fas fa-tachometer-alt fa-lg"></i>&nbsp;${rec.preparation === null ? '' : rec.preparation}
                        <span class="person"><i class="fas fa-utensils fa-lg"></i>&nbsp;${rec.personNumber === null ? '' : rec.personNumber}</span></h3>
                    </div>
                </div>`);
        $recipe.appendTo($recipeContainer);
        $(`.image_${rec.id}`).on('click', async () => await countViews(rec.id));
        $(`.image_${rec.id}`).on('click', () => fullRecipes(rec.id));
        $(`#fav_${rec.id}`).on('click', async () => await addToFavorites(rec.id));
    }
};

function fullRecipes(id) {
    sessionStorage.setItem('idOfCardRecipe', id);
    window.open('recipe.html', '', '');
};

async function countViews(recipeId) {
    const recipe = await getBase(`/recipes/${recipeId}`);
    const numberOfViews = recipe.views;
    const newViews = {views: (numberOfViews + 1)};
    (async () => await api.patch(`/recipes/${recipeId}`, newViews))();
};

const fav = {favorites: []};
async function addToFavorites(recipeId) {
    const iconId = event.currentTarget.id;
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
        fav['favorites'] = user.favorites;
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

async function renderCategories() {
    $('.content').html(`<h1 class="recipes-click-scroll">${'Kategorije'.toUpperCase()}</h1><div class="recipes-container"></div>`);
    const categories = await getBase('/categories');
    const categoryName = categories[0].name;
    const categoryImage = categories[0].image;
    for (const cat of categoryName) {
        const $recipeContainer = $('.recipes-container');
        const $recipe = $(`<div class="recipes" id="category_${categoryName.indexOf(cat)}">
                            <img src="./img/${categoryImage[categoryName.indexOf(cat)]}" alt="categories" title="${cat}"><br>
                            <h2 class="recipes-descr recipes-height">${cat.toUpperCase()}</h2>
                            <hr>
                        </div>`);
        $recipe.appendTo($recipeContainer);
        $(`#category_${categoryName.indexOf(cat)}`).on('click', async () => await renderAllRecipes(`${cat.toUpperCase()}:`, `?category=${cat.toString()}&_sort=id&_order=desc`));
    }
    animateFocus('.recipes-click-scroll');
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
        .catch((error) => alert(error));
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
        $(`#cook${index}`).children('h6').html(`Novi&nbsp;recepti: ${recipes.length === undefined ? 0 : recipes.length}`);
        $(`#cook${index}`).on('click', async () => await renderAllRecipes(`${cat.toUpperCase()}:`, `?category=${cat}&_sort=id&_order=desc`));
        index++;
    }
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
    } else if (page.search('/register.html') >= 0) {
        return $('#writeRecipe input').on('input', validationCheck);
    }
};

function eventsAll() {
    $('#recipes_showAll').on('click', async () => await renderAllRecipes('Vrhunski recepti - baza recepata:', ''));
    $('#categories_showAll').on('click', async () => await renderCategories());
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
    $('#home, #slider').on('click', () => animateFocus('#home'));
    $('#plus-ingredient').on('click', addIngredient);
    $('#minus-ingredient').on('click', () => deleteFields('.form-right-1', 'input'));
    $('#plus-step').on('click', addStep);
    $('#minus-step').on('click', () => deleteFields('.form-right-2', 'textarea'));
};

$(document).on('load', animateBackground(), onLoadPageHTML(), addLogOut(), categoryButtons(), eventsAll(), animationsAll(), favorites(), loadFavorites());

export {api, getBase, renderAllRecipes, _render_one_recipe, postIntoDatabase, addToFavorites, loadFavorites, animateFocus};
