// gulp targets
//    dev - run a local webserver, continuously rebuilt from files
//    build - compile the files into build/
//    clean - remove any build artifacts
//

(function() {
  'use strict';

  var gulp = require('gulp'),
      // gulp helpers
      gutil       = require('gulp-util'),
      sequence    = require('run-sequence'),
      // build utils
      clean       = require('gulp-clean'),
      concat      = require('gulp-concat'),
      html2js     = require('gulp-ng-html2js'),
      minifyHtml  = require('gulp-minify-html'),
      uglify      = require('gulp-uglify'),
      less        = require('gulp-less'),
      // server utils
      changed     = require('gulp-changed'),
      connect     = require('connect'),
      serveStatic = require('serve-static'),
      historyFallback = require('connect-history-api-fallback');

  // Define files and directories
  var buildDir    = 'build',
      indexFile   = 'site/index.html',
      htmlFiles   = 'site/**/*.html',
      lessFiles   = 'site/**/*.less',
      jsFiles     = 'site/**/*.js',
      publicFiles = 'public/**/*';

  // Run a local webserver, continously rebuild the site
  gulp.task('dev', function() {
    sequence('clean', 'copy-index', 'copy-js', 'build-css', 'copy-public', 'build-templates', 'server', 'watch');
  });

  // Build compiles all the files into the build directory
  gulp.task('build', function() {
    sequence('clean', 'copy-index', 'copy-js', 'build-css', 'copy-public', 'build-templates');
  });

  // Clean deletes the build directory and other build artifacts
  gulp.task('clean', function() {
    return gulp.src(buildDir, {read: false}).pipe(clean());
  });

  // Copy index html to build directory
  gulp.task('copy-index', function() {
    return gulp.src(indexFile, {base: './'})
               .pipe(gulp.dest(buildDir));
  });

  // Copy javascript files to build directory
  gulp.task('copy-js', function() {
    return gulp.src(jsFiles, {base: './'})
               .pipe(changed(buildDir))
               .pipe(gulp.dest(buildDir));
  });

  // Copy public assets to build directory
  gulp.task('copy-public', function() {
    return gulp.src(publicFiles, {base: './'})
               .pipe(changed(buildDir))
               .pipe(gulp.dest(buildDir));
  });

  // Minify and convert site templates to javascript
  gulp.task('build-templates', function() {
    return gulp.src(htmlFiles, {base: './'})
               .pipe(minifyHtml({empty: true, spare: true, quotes: true}))
               .pipe(html2js({moduleName: 'astron.templates'}))
               .pipe(concat('templates.js'))
               .pipe(uglify())
               .pipe(gulp.dest(buildDir));
  });

  // Create CSS files from LESS files
  gulp.task('build-css', function() {
    return gulp.src('site/site.less', {base: './'})
               .pipe(less({dumpLineNumbers: 'comments'}))
               .pipe(concat('site.css'))
               .pipe(gulp.dest(buildDir));
  });

  // Serve development server from build directory
  gulp.task('server', function() {
    var site = connect();
    site.use(historyFallback);
    site.use(serveStatic(buildDir + '/site'));
    site.listen(8080);
    gutil.log('Development server started at:', gutil.colors.cyan('http://localhost:8080'));
  });

  // Watch files and re-build as necessary while server is running
  gulp.task('watch', function() {
    gulp.watch(indexFile,   ['copy-index']);
    gulp.watch(jsFiles,     ['copy-js']);
    gulp.watch(lessFiles,   ['build-css']);
    gulp.watch(publicFiles, ['copy-public']);
    gulp.watch(htmlFiles,   ['build-templates']);
  });
})();
