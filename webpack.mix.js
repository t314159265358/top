const mix = require('laravel-mix');

require('laravel-mix-obfuscator');

mix.js('src/scripts/app.js', 'dist/scripts')
    .sass('src/styles/app.scss', 'dist/styles')
    .sourceMaps(false)
    .obfuscator();
