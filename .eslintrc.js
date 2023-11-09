module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "no-unused-vars": "off",
        "react/prop-types": 0,
        "no-unreachable": "off",
        'no-async-promise-executor': 'off',
        // 'quotes': ['ignore', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
        'react/no-unescaped-entities': 'off'
    }
}
