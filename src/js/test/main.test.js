import fizzBuzz from '../main';

describe('FizzBuzz', () => {

    it('should return number itself', () => {
        expect(fizzBuzz(7)).toBe('7');
    });

    it('should return Fizz when divisible by three', () => {
        expect(fizzBuzz(3)).toBe('Fizz');
    });

    it('should return Buzz when divisible by five', () => {
        expect(fizzBuzz(5)).toBe('Buzz');
    });

    it('should return FizzBuzz when divisible by both three and five', () => {
        expect(fizzBuzz(15)).toBe('FizzBuzz');
    });

});
