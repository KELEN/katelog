const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pump = require('pump');


gulp.task('compile', function (cb) {
    pump([
        gulp.src('./src/k-catelog.js'),
        babel({  presets: ['env'] }),
        uglify({
            mangle: {
                toplevel: true
            }
        }),
        gulp.dest('dist')
    ], cb)
});

gulp.task('watch', function () {
    gulp.watch('./src/k-catelog.js', ['compile'])
})