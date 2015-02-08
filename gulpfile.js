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
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util');

var env = process.env.NODE_ENV || 'development';
var outputDir = './public';
var scriptFiles = './src/**/*';

var getBundleName = function () {
  return 'bundle';
};

gulp.task('js', function() {

  var bundler = browserify({
    entries: ['./src/app'],
    debug: env === 'dev'
  });

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
      .pipe(connect.reload());
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
  gulp.start('connect');
  gulp.watch(scriptFiles,['js']);
});
