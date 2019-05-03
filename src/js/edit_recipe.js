import $ from 'jquery';
import {api} from './main';
import {createRecipe} from './add_recipe';
'use strict';

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

export {addIngredient, addStep, deleteFields, loadRecipeToForm};
