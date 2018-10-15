const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const pump = require('pump')
const rename = require('gulp-rename')


gulp.task('compile', function (cb) {
    pump([
        gulp.src('./index.js'),
        babel({  presets: ['env'] }),
        uglify({
            mangle: {
                toplevel: true
            }
        }),
        rename('katelog.min.js'),
        gulp.dest('dist')
    ], cb)
});

gulp.task('watch', function () {
    gulp.watch('./index.js', ['compile'])
})
