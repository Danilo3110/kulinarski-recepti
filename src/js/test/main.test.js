import {getBase} from '../main';

describe('getBase', () => {

    it('return all users', async () => {
        expect.assertions(1);
        const expected = {
            "users": []
        };
        const users = await getBase('/users');
        expect(expected).toEqual(expect.not.objectContaining(users));
    });

    it('id of the second user', async () => {
        expect.assertions(1);
        const user = await getBase('/users/2');
        const userId = user.id;
        expect(userId).toBe(2);
    });

    it('name of the first user', async () => {
        expect.assertions(1);
        const user = await getBase('/users/1');
        const userName = user.name;
        expect(userName).toBe('Danilo Lukic');
    });

    it('get all recipes from database', async () => {
        expect.assertions(1);
        const recipes = await getBase('/recipes');
        const numberOfRecipes = recipes.length;
        expect(numberOfRecipes).toBe(24);
    });
});
