import $ from 'jquery';
import {postIntoDatabase} from './main';
'use strict';

const valid = {};

function validationCheck() {
    let input = event.currentTarget.name;
    const RegEx = {
        name: /^[A-ZŠĐŽČĆ][a-zšđžčć]{2,}\s[A-ZŠĐŽČĆ][a-zšđžčć]+$/,
        email: /^[a-z][a-z.\d]+[@][a-z]{3,}.[a-z]{2,3}$/,
        password: /^(?=[A-Za-z_]+\d)\w{8,}$/,
        work: /^[A-ZŠĐŽČĆ][a-zšđžčć]{3,}\s?[A-ZŠĐŽČĆa-zšđžčć]+/,
        telephone: /^\d{3}\/(\d{2,3}-?\d{2,3}-?\d{2,}|\d{3,4}-?\d{3,4})$/
    };
    const passwordRepeat = $('#password').val() === $('#passwordRepeat').val();
    const city = $('#city').val() !== null;

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

export {validationCheck, createUser};
