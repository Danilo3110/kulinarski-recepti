module.exports = {
    plugins: {
        'postcss-import': {},
        'postcss-preset-env': {
            browsers: [
                '>1%',
                'last 5 versions',
                'Firefox ESR',
                'not ie < 9',
            ]
        },
        'cssnano': {},
    },
};