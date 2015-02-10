/*jslint node: true */
'use strict';

var browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpif = require('gulp-if'),
    connect = require('gulp-connect'),
    gutil = require('gulp-util'),
    to5ify = require("6to5ify"),
    gulpif = require('gulp-if');

var env = process.env.NODE_ENV || 'development';
var isInDevelopmentMode = env === 'development'
var outputDir = './public';
var scriptFiles = './src/**/*';

var getBundleName = function () {
  return 'bundle';
};

gulp.task('js', function() {

  var bundler = browserify({
    entries: ['./src/app'],
    debug: isInDevelopmentMode
  }).transform(to5ify);

  var bundle = function() {
    return bundler
      .bundle()
      .on('error', gutil.log)
      .pipe(source(getBundleName() + '.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
      .pipe(gulpif(env === 'prod',uglify()))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(outputDir + '/js/'))
      .pipe(gulpif(isInDevelopmentMode, connect.reload()));
  };

  return bundle();
});

gulp.task('watch', function () {
  gulp.watch(scriptFiles,['js']);
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('default', function() {
  gulp.start('js');
  if (isInDevelopmentMode) {
    gulp.start('connect');
    gulp.watch(scriptFiles,['js']);
  }
});
