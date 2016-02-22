const gulp = require('gulp');
const rimraf = require('rimraf');
const pkg = require('./package.json');
const $ = require('gulp-load-plugins')();

gulp.task('clean', (cb) => {
  rimraf('./package', cb);
});

gulp.task('build', () => {
  return gulp.src('app/**/*')
    .pipe($.if('manifest.json', $.jsonEditor({version: pkg.version})))
    .pipe($.zip(`${pkg.name}-${pkg.version}.zip`))
    .pipe(gulp.dest('./package'))
});

gulp.task('default', ['build']);
