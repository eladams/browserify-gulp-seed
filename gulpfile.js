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
    babelify = require("babelify"),
    gulpif = require('gulp-if'),
    watchify = require("watchify");

var env = process.env.NODE_ENV || 'development';
var isInDevelopmentMode = env === 'development';
var outputDir = './public';
var scriptFiles = './src/**/*';

var getBundleName = function () {
  return 'bundle';
};

var bundler = browserify({
  entries: ['./src/app'],
  transform: [babelify],
  debug: isInDevelopmentMode,
  cache: {}, packageCache: {}, fullPaths: true
});

if (isInDevelopmentMode) {
  bundler = watchify(bundler);
}
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

gulp.task('js', bundle);

function bundle() {
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
}


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
  }
});
