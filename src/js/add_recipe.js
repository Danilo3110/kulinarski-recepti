import $ from 'jquery';
import {api} from './main';
'use strict';

function createRecipe(methodPost = true) {
    const recipesObj = {};
    const option = [];

    if (methodPost) {
        const currentDate = new Date();
        const recipeCreated = currentDate.toLocaleString('sr-RS');
        const randomCheckingTime = Math.floor(Math.random() * Math.floor(24));
        const recipeChecked = new Date(currentDate.setHours(currentDate.getHours() + randomCheckingTime)).toLocaleString('sr-RS');
        recipesObj['recipeCreated'] = recipeCreated;
        recipesObj['recipeChecked'] = recipeChecked;

        recipesObj['recipeNumber'] = Math.floor(Math.random() * 999);
        recipesObj['views'] = 0;
    }
    recipesObj['authorId'] = JSON.parse(localStorage.getItem('id'));
    const $writeRecipe = $('#writeRecipe');
    
    $writeRecipe.find('input:not(:checkbox), textarea, select').each(function () {
        recipesObj[this.name] = this.value;
    });
    $writeRecipe.find('input[type="number"]').each(function () {
        recipesObj[this.name] = Number(this.value);
    });
    $writeRecipe.find(':checkbox').each(function () {
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
        const file = $("#imgUrl")[0].files;
        if (file.length > 0) {
            recipesObj['imgUrl'] = ('./img/' + file[0].name);
        } else {
            recipesObj['imgUrl'] = '';
        }
        const message = 'Uspešno ste objavili novi kulinarski recept';
        (async () => {
            await postIntoDatabase('recipes', recipesObj, message);
            await (location.href = 'user_panel.html');
        })();
    } else return recipesObj;
};

async function postIntoDatabase(location, obj, message) {
    return await api.post(`/${location}`, obj)
        .then((response) => alert(`${message}`))
        .catch((error) => alert(error));
};

export {createRecipe, postIntoDatabase};
