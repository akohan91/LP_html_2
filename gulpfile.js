var gulp = require('gulp'), //Сам менеджер задач
    vfs = require('vinyl-fs'),
    less = require('gulp-less'), //Компилирует less файлы в css
    path = require('path'),
    concat = require('gulp-concat'),
    debug = require('gulp-debug'), //Принимает в себя поток и выводит его в консоль
    sourcemaps = require('gulp-sourcemaps'), //Делает карту файлов в css для разработки
    del = require('del'), //Удаляет указанную дирректорию
    browsersync = require('browser-sync'), //Автообновление браузера
    notify = require('gulp-notify'), //Для поиска ошибок
    plumber = require('gulp-plumber'), //Отслеживание пошибок в каждом потоке
    newer = require('gulp-newer'), //Фильтр не пропускающий неизмененные
    autoprefixer = require('gulp-autoprefixer'), //Автодобавление префиксов
    smartgrid = require('smart-grid'), // Генератор сеток
    rigger = require('gulp-rigger'), //Подключаемые файлы для сайта
    imagemin = require('gulp-imagemin'),
    mincss = require('gulp-minify-css'),
    fileinclude = require('gulp-file-include');

// Встраивает Html код в нужные файлы
gulp.task('fileinclude', function() {
    vfs.src('./frontend/*.html') //Выберем файлы по нужному пути
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        
        .pipe(gulp.dest('build')) //выгрузим их в папку build
        .pipe(debug()); // Выводит поток в консоль
});


//Выполняет преобразование файлов .less в .css
gulp.task('less', function() {
    return vfs.src('frontend/css/*.less') //Выберем файлы по нужному пути
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        //.pipe(sourcemaps.init()) //Делает карту файлов в css
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        })) // Less to css
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        })) // Автопрефиксы
        //.pipe(mincss()) //Сожмем
        //.pipe(sourcemaps.write('.')) //Пишет карту файлов в css
        //.pipe(newer('build/css'))  // Не пропускает не обновл. файлы
        .pipe(gulp.dest('build/css')) //выгрузим их в папку build
        .pipe(debug()); // Выводит поток в консоль
});

// билдим статичные изображения
gulp.task('image:css', function() {
    vfs.src('frontend/css/images/**/*.*') //Выберем наши картинки
        .pipe(newer('build/css/images'))
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{
                removeViewBox: false
            }], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest('build/css/images')) //выгрузим в build
        .pipe(debug()); // Выводит поток в консоль
});

// билдим динамичные изображения
gulp.task('image:content', function() {
    vfs.src('frontend/images/**/*.*') //Выберем наши картинки
        .pipe(newer('build/images'))
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{
                removeViewBox: false
            }], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest('build/images')) //выгрузим в build
        .pipe(debug()); // Выводит поток в консоль
});

//Билд шрифтов
gulp.task('fonts', function() {
    vfs.src('frontend/fonts/**/*.*')
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        .pipe(newer('build/fonts'))
        .pipe(gulp.dest('build/fonts')) //выгружаем в build
        .pipe(debug()); // Выводит поток в консоль
});

//Билд css
gulp.task('css', function() {
    vfs.src('frontend/**/*.{css,js}')
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        .pipe(newer('build'))
        .pipe(gulp.dest('build')) //выгружаем в build
        .pipe(debug()); // Выводит поток в консоль
});

// Наблюдает за изменениями в исходниках
gulp.task('watch', function() {
    gulp.watch('frontend/**/*.*', ['build']) //При изменении в 'frontend' BUILD
    gulp.watch('build/**/*.*').on('change', browsersync.reload); //При изменении в 'build' reload
});

//Создает сервак
gulp.task('browser', function() {
    browsersync.init({
        server: {
            baseDir: "build"
        }
    });
});

// Запускает всю схему
gulp.task('develop', ['watch', 'browser']);

// Собирает проект
gulp.task('build', [
    'fileinclude',
    'less',
    'image:css',
    'image:content',
    'fonts',
    'css'
]);

//Удаляет все из папки biuld
gulp.task('del', function() {
    return del('build')
});

//Билд backup
gulp.task('backup', function() {
    vfs.src('frontend/**/*.*')
        .pipe(plumber({
            errorHandler: notify.onError()
        })) // Обраб ошибок
        .pipe(newer('backup'))
        .pipe(gulp.dest('backup')) //выгружаем в build
        .pipe(debug()); // Выводит поток в консоль
});

//////////////////////////////////////////////////////////////////////////////////////
gulp.task('smart', function() {
    var settings = {
        outputStyle: 'less',
        /* less || scss || sass || styl */
        columns: 12,
        /* number of grid columns */
        offset: "30px",
        /* gutter width px || % */
        container: {
            maxWidth: '1200px',
            /* max-width оn very large screen */
            fields: '30px' /* side fields */
        },
        breakPoints: {
            lg: {
                'width': '1100px',
                /* -> @media (max-width: 1100px) */
                'fields': '30px' /* side fields */
            },
            md: {
                'width': '960px',
                'fields': '15px'
            },
            sm: {
                'width': '780px',
                'fields': '15px'
            },
            xs: {
                'width': '560px',
                'fields': '15px'
            }
            /* 
        We can create any quantity of break points.
 
        some_name: {
            some_width: 'Npx',
            some_offset: 'N(px|%)'
        }
        */
        }
    };
    smartgrid('./frontend', settings);
});