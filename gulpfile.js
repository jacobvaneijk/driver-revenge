var browserify = require('browserify');
var watchify = require('watchify');
var postcss = require('gulp-postcss');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var gulp = require('gulp');
var del = require('del');

/**
 * Converts SCSS to CSS.
 */
gulp.task('scss', function () {
    return gulp.src('./src/scss/main.scss')
        .pipe(sass())
            .on('error', notify.onError({
                message: '<%= error.message %>',
                title: 'Error in SCSS',
            }))
        .pipe(postcss([
            require('postcss-partial-import'),
            require('autoprefixer')({
                'browsers': [
                    'ie >= 10',
                    'ie_mob >= 10',
                    'ff >= 30',
                    'chrome >= 34',
                    'safari >= 7',
                    'opera >= 23',
                    'ios >= 7',
                    'android >= 4.4',
                    'bb >= 10',
                ],
            }),
            require('csswring'),
        ]))
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('./public/css'))
    ;
});

/**
 * Bundle the JavaScript files.
 */
var browserifyTask = function (done, dev) {
    var bundles = [
        {
            'transformers': {},
            'fileName': 'desktop.min.js',
            'entries': './src/js/desktop/main.js',
            'dest': './public/js',
        },
        {
            'transformers': {},
            'fileName': 'mobile.min.js',
            'entries': './src/js/mobile/main.js',
            'dest': './public/js',
        },
    ];

    bundles.map(function (bundle) {
        if (dev) {
            bundle.packageCache = {};
            bundle.plugin = [
                watchify,
            ];
            bundle.cache = {};
        }

        var bundler = browserify(bundle);

        for (var transformer in bundle.transformer) {
            bundler.transform(require(transformer), bundle.transformers[transformer]);
        }

        var createBundle = function () {
            return bundler
                .bundle()
                    .on('error', notify.onError({
                        message: '<%= error.message %>',
                        title: 'Error in JavaScript',
                    }))
                .pipe(source(bundle.fileName))
                .pipe(buffer())
                    .pipe(uglify())
                .pipe(gulp.dest(bundle.dest))
            ;
        };

        if (dev) {
            bundler.on('update', createBundle);
        }

        return createBundle();
    });

    return done();
};

gulp.task('watchify', function (done) {
    return browserifyTask(done, true);
});

gulp.task('js', browserifyTask);

gulp.task('clean', function () {
    del([
        './public/css',
        './public/js',
    ])
});

/**
 * Watch for file changes.
 */
gulp.task('watch', function () {
    gulp.watch('./src/js/{desktop,mobile,server}/**/*.js', ['watchify']);
    gulp.watch('./src/scss/**/*.scss', ['scss']);
});

/**
 * The default task for running Gulp.
 */
gulp.task('default', ['scss', 'js']);
