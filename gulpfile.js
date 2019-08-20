var  gulp = require('gulp'),
less = require('gulp-less'),
browserSync = require('browser-sync'),
concat = require('gulp-concat'),
uglifyJs = require('gulp-uglifyjs'),
cssNano = require('gulp-cssnano'),
rename =  require('gulp-rename'),
autoprefixer = require('gulp-autoprefixer'),
del = require('del'),
imagemin = require('gulp-imagemin'),
pug = require('gulp-pug');

function wrapPipe(taskFn) {
    return function(done) {
      var onSuccess = function() {
        done();
      };
      var onError = function(err) {
        done(err);
      }
      var outStream = taskFn(onSuccess, onError);
      if(outStream && typeof outStream.on === 'function') {
        outStream.on('end', onSuccess);
      }
    }
}

gulp.task('less', wrapPipe(function(success, error) {
    return gulp.src([
        'app/less/main.less'
    ])
    .pipe(less().on('error', error))
    .pipe(autoprefixer([
        'last 10 versions'
        ], {
          cascade: true
        })
    )
    .pipe(gulp.dest('app/css'));
}));

gulp.task('browser-sync', function() {
browserSync({
    server: {
        baseDir: 'build'
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: 'my projects'
    });
});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('app/less/**/*.less', ['min-css', browserSync.reload]);
    gulp.watch('app/img/**/*.*', ['compress', browserSync.reload]);
    gulp.watch('app/js/**/*.js', ['min-js', browserSync.reload]);
    gulp.watch('app/pug/**/*.pug', ['html', browserSync.reload]);
});

gulp.task('min-js', ['js'], function() {
    return gulp.src([
        'build/js/*'
    ])
    .pipe(uglifyJs())
    .pipe(rename({
        suffix: '.min'
      }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js', function() {
    return gulp.src([
        'app/js/main.js'
    ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('min-css', ['less'] , function() {
    return gulp.src([
        'app/css/main.css'
    ])
    .pipe(cssNano())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/css'));
});

gulp.task('clean', function() {
    return del.sync('build');
});

gulp.task('compress', function() {
    gulp.src('app/img/**')
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'));
});

gulp.task('html', function() {
    return gulp.src('app/pug/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('build'))
});

gulp.task('build', ['clean', 'html', 'compress', 'min-css', 'min-js'], function() {

    gulp.src('app/js/pages/*.json')
    .pipe(gulp.dest('build/js'));

});

gulp.task('default', ['build', 'watch']);