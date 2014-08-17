// gulp targets
//    run   - run a local webserver, continuously rebuilt from files
//    build - compile the files into build/
//    clean - remove any build artifacts
//

(function() {
  'use strict';

  var gulp = require('gulp'),
      // node stdlib
      path     = require('path'),
      // gulp helpers
      util     = require('gulp-util'),
      foreach  = require('gulp-foreach'),
      sequence = require('run-sequence'),
      // build utils
      clean    = require('gulp-clean'),
      insert   = require('gulp-insert'),
      concat   = require('gulp-concat'),
      rename   = require('gulp-rename'),
      replace  = require('gulp-replace'),
      render   = require('gulp-file-include'),
      markdown = require('gulp-markdown'),
      less     = require('gulp-less'),
      // server utils
      connect  = require('connect'),
      history  = require('connect-history-api-fallback'),
      changed  = require('gulp-changed'),
      serve    = require('serve-static');

  // Define directories
  var paths = {
    docs:      'docs',
    build:     'build',
    pages:     'build/pages',
    website:   'build/site',
    templates: 'templates'
  }

  // Define file globs
  var files = {
    html: 'site/**/*.html',
    less: 'site/**/*.less',
    js:   'site/**/*.js',

    home:      'site/index.html',
    style:     'site/*.less',
    template:  'site/template.html',
    resources: 'resources/**',
    astronDocs: paths.docs + '/astron/**/*.md',
    bambooDocs: paths.docs + '/bamboo/**/*.md',
    pages:      paths.pages + '/**/**/*.html'
  }

  // Run a local webserver, continously rebuild the site
  gulp.task('run', function() {
    sequence('build', 'server', 'watch');
  });

  // Compiles the full site into the build directory
  gulp.task('build', function() {
    sequence('clean', 'render-index', 'render-astron', 'render-bamboo',
                      'render-less', 'copy-js', 'copy-files');
  });

  // Renders astron's markdown docs into html
  gulp.task('render-astron', function() {
    gulp.src(files.astronDocs, { base: paths.docs })
        .pipe(markdown())
        .pipe(gulp.dest(paths.pages))
        .pipe(foreach(function(stream, file) {
            var pageTitle = path.basename(file.path, '.html');
            if(pageTitle === 'index') { pageTitle = 'a distributed object-oriented game server'; }
            return gulp.src(files.template)
                       .pipe(replace(/@markdown/, file.path))
                       .pipe(replace(/@project/, 'astron'))
                       .pipe(replace(/@fullTitle/, 'Astron'))
                       .pipe(replace(/@pageTitle/, pageTitle))
                       .pipe(render('%%'))
                       .on('error', function(error) {
                          util.log('Error in', util.colors.cyan('render-astron'), error.message);
                        })
                       .pipe(rename(path.relative(file.base, file.path)));
         }))
        .pipe(gulp.dest(paths.website));
  })

  // Renders bamboo's markdown docs into html
  gulp.task('render-bamboo', function() {
    gulp.src(files.bambooDocs, { base: paths.docs })
        .pipe(markdown())
        .pipe(gulp.dest(paths.pages))
        .pipe(foreach(function(stream, file) {
            var pageTitle = path.basename(file.path, '.html');
            if(pageTitle === 'index') { pageTitle = 'object-oriented protocols'; }
            return gulp.src(files.template)
                       .pipe(replace(/@markdown/, file.path))
                       .pipe(replace(/@project/, 'bamboo'))
                       .pipe(replace(/@fullTitle/, 'Bamboo'))
                       .pipe(replace(/@pageTitle/, pageTitle))
                       .pipe(render('%%'))
                       .on('error', function(error) {
                          util.log('Error in', util.colors.cyan('render-bamboo'), error.message);
                        })
                       .pipe(rename(path.relative(file.base, file.path)));
         }))
        .pipe(gulp.dest(paths.website));
  })

  // Renders the less files into a single css file
  gulp.task('render-less', function() {
    gulp.src(files.style)
        .pipe(less())
        .on('error', function(error) {
           util.log('Error in', util.colors.cyan('render-less'), error.message);
         })
        .pipe(rename(function(path) { path.dirname += '/site/css' }))
        .pipe(gulp.dest(paths.build));
  });

  // Renders the homepage from templates and partials
  gulp.task('render-index', function() {
    gulp.src(files.home)
        .pipe(render('%%'))
        .on('error', function(error) {
           util.log('Error in', util.colors.cyan('render-index'), error.message);
         })
        .pipe(gulp.dest(paths.website));
  });

  // Copy the javascript files to build
  gulp.task('copy-js', function() {
    gulp.src(files.js)
        .pipe(changed(paths.website))
        .pipe(gulp.dest(paths.website));
  });

  // Copy the other resource files to build
  gulp.task('copy-files', function() {
    gulp.src(files.resources)
        .pipe(changed(paths.website))
        .pipe(gulp.dest(paths.website));
  });

  // Clean deletes the build directory and other build artifacts
  gulp.task('clean', function() {
    return gulp.src(paths.build, {read: false})
               .pipe(clean());
  });

  // Serve development server from build directory
  gulp.task('server', function() {
    var site = connect();
    site.use(history);
    site.use(serve(paths.website));
    site.listen(8080);
    util.log('Go to', util.colors.cyan('http://localhost:8080'), 'in a browser.');
  });

  // Watch files and re-build as necessary while server is running
  gulp.task('watch', function() {
    gulp.watch(files.home,       ['render-index']);
    gulp.watch(files.astronDocs, ['render-astron']);
    gulp.watch(files.bambooDocs, ['render-bamboo']);
    gulp.watch(files.html,       ['render-astron', 'render-bamboo', 'render-index']);
    gulp.watch(files.less,       ['render-less']);
    gulp.watch(files.js,         ['copy-js']);
  });
})();
