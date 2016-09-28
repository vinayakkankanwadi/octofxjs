'use strict';

// dependencies 
var gulp = require('gulp'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version'),
	octo = require('@octopusdeploy/gulp-octo');

var less = require('gulp-less'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    jsmin = require('gulp-jsmin'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean');

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */
 
function inc(importance) {
    // get all the files to bump version in 
    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files 
        .pipe(bump({type: importance}))
        // save it back to filesystem 
        .pipe(gulp.dest('./'))
	   // commit the changed version number 
        //.pipe(git.commit('-a bumps package version'))
		.pipe(git.commit('bumps package version', {args: '-am'}))
		//.pipe(git.addRemote('origin/gulp', 'https://github.com/vinayakkankanwadi/octofxjs'))
		//.pipe(git.push('origin', 'gulp', {args: " -f"}))
		// read only one file to get the version number 
        .pipe(filter('package.json'))
        // **tag it in the repository** 
        .pipe(tag_version());
}	

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })

gulp.task('push', function() { git.push('origin/gulp'); })

gulp.task('less', function() {
  return gulp.src('./src/less/**/*.less')
      .pipe(less())
      .pipe(cssmin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./public/css/'));
});

gulp.task('scripts', function() {
  return gulp.src(['./src/js/vendor/**/*.js', './src/js/app/**/*.js'])
      .pipe(concat('script.js'))
      .pipe(jsmin())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('./public/js/'));
});

gulp.task('build', ['less', 'scripts']);

gulp.task('default', ['less', 'scripts'], function() {
  gulp.watch('./src/less/**/*.less', ['less']);
  gulp.watch(['./src/js/vendor/**/*.js', './src/js/app/**/*.js'], ['scripts']);
});

gulp.task('clean-public', function () {
  return gulp.src(['./public/js', './public/css'], {read: false})
      .pipe(clean());
});

gulp.task('bump', function(){
  return gulp.src('./package.json')
      .pipe(bump({type: 'patch'}))
      .pipe(gulp.dest('./'));
});
 
//gulp.task('publish', ['bump', 'build'], function () {
gulp.task('publish', ['patch', 'push', 'build'], function () {
  return gulp.src(['**/*', '!bin{,/**}', '!src{,/**}', '!gulpfile.js'])
      .pipe(octo.pack())
      .pipe(octo.push({apiKey: 'API-37YDE3A206MDYXKVLX8LVDVQCI', host: 'http://localhost:9111'}));
});