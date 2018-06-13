const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pump = require('pump');

gulp.task('compile', function (cb) {
    pump([
        gulp.src('./src/k-catelog.js'),
        babel({  presets: ['env'] }),
        uglify(),
        gulp.dest('dist')
    ], cb)
});