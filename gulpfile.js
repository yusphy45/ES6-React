/**
 * Created by hanjinchi on 15/6/29.
 */
var gulp = require('gulp');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var babel = require('gulp-babel').bind(null, {compact: false});
var traceur = require('gulp-traceur');

var lazyWatch = function (glob, task) {
  return function () {
    var tick;
    gulp.watch(glob, function () {
      if (tick) return;
      tick = setTimeout(function () {
        runSequence(task);
        tick = void 0;
      })
    })
  };
};

gulp.task('compile.js', function () {
  return gulp.src('./js/*.js').pipe(concat('compile.js')).pipe(babel()).pipe(gulp.dest('dist'));
});

gulp.task('dev', ['compile.js'], lazyWatch('./js/*.js', 'compile.js'));

