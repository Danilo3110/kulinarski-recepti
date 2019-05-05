import $ from 'jquery';
import {api, getBase, animateFocus, addToFavorites, renderAllRecipes} from './main';
'use strict';

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
            <div class="single-recipe-img"><img src="${recipes.imgUrl === '' ? './img/image-not-found.jpg' : recipes.imgUrl}" alt="${recipes.title}"></div>
            <div class="single-recipe-data">
                <div>
                    <h5>Kuhinja: ${recipes.kitchen}</h5>
                    Težina pripreme: ${recipes.preparation}<br><br>
                    Broj osoba: <i class="fas fa-male fa-lg">&nbsp;${recipes.personNumber === null ? '' : recipes.personNumber}</i><br><br>
                    Vreme pripreme: <div class="numStep">${recipes.timePrep}</div>minuta<br><br>
                    Posno:&nbsp;${recipes.posno === true ? 'DA': 'NE'}<br><br>
                    ${recipes.vegetarijanski === true ? '<img src="./img/vegeterian.png" class="vegeterian" alt="vegeterian">': ''}<br>
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
                <span><i title="Broj pregleda" class="far fa-eye fa-lg">&nbsp;${recipes.views}</i></span>
            </div>
            <hr>
            <div class="single-recipe-detailed">
                <h3>Opis</h3>
                <div>${recipes.recipeInfo}</div><br>
            </div>
            <hr>
            <div class="single-recipe-ingredients">
                <h3>Potrebni&nbsp;sastojci</h3>
                <table class="ingredients"><tr><th>Količina</th><th>Sastojci</th></tr></table><br>
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
        $(`#fav_${recipes.id}`).on('click', async () => await addToFavorites(recipes.id));
        $(`#showUserRecipes`).on('click', async () => await renderAllRecipes(`Svi recepti korisnika - ${users.name}:`, `?authorId=${users.id}`));
    }
};

function printRecipe() {
    const $body = $('body');
    const restorepage = $body.html();
    const printcontent = $('#content').clone();
    $body.empty().html(printcontent);
    print();
    $body.html(restorepage);
    location.reload();
};

export {renderFullRecipe};
