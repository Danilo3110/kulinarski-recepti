import $ from 'jquery';
import {api, getBase, _render_one_recipe, animateFocus, loadFavorites} from './main';
'use strict';

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

async function deleteRecipes(message) {
    const recipe = event.currentTarget.parentElement.id;
    if (confirm('Da li ste sigurni da želite da obrisete odabrani recept ?')) {
        return await api.delete(`/recipes/${recipe}`)
            .then((response) => { alert(`${message}`); location.reload(); })
            .catch((error) => { alert(error); });
    }
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

export {usersRecipes};
