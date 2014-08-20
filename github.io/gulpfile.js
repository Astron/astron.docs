// gulp targets
//    run   - run a local webserver, continuously rebuilt from files
//    build - compile the files into build/
//    clean - remove any build artifacts
//

(function() {
  'use strict';

  var gulp = require('gulp'),
      // node tools
      fs       = require('fs'),
      path     = require('path'),
      _        = require('lodash'),
      yaml     = require('js-yaml'),
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
      webserver = require('gulp-webserver'),
      changed   = require('gulp-changed');

  // Define directories
  var paths = {
    docs:      'docs',
    build:     'build',
    website:   'build/site',
    rendered:  'build/output',
    templates: 'site'
  }

  // Define files and file globs
  var files = {
    // Watch globs
    html:      'site/**/*.html',
    less:      'site/**/*.less',

    // Source globs
    styles:    'site/*.less',
    scripts:   'site/**/*.js',
    markdown:  'docs/**/**/*.md',
    resources: 'resources/**',
    rendered:  'build/output/**/**/*.html',

    // Unique files
    docpage:  'site/docpage.html',
    manifest: 'docs/manifest.yaml',
    pages: [
      'site/index.html',
      'site/license.html',
      'site/astron/index.html',
      'site/bamboo/index.html'
    ]
  }

  // Run a local webserver, continously rebuild the site
  gulp.task('run', function() {
    sequence('build', 'server', 'watch');
  });

  // Compiles the full site into the build directory
  gulp.task('build', function() {
    return sequence('clean', ['copy-scripts', 'copy-resources'],
                    'render-docpages', ['render-static', 'render-less']);
  });

  // Render markdown docs into html docs
  gulp.task('render-markdown', function() {
    return gulp.src(files.markdown)
               .pipe(changed(paths.rendered, {extension: '.html'}))
               .pipe(markdown())
               .pipe(gulp.dest(paths.rendered));
  });

  //Render the table of contents for each language and version
  gulp.task('render-contents', function() {
    function buildContents(pages) {
      var toc = '<aside class="toc">\n';

      var inList = false;
      _.forEach(pages, function(page) {
        if(_.isUndefined(page.section)) {
          // Add new page link
          if(!inList) { toc += '  <ul>\n'; inList = true; }
          toc += '    <li><a href="' + page.filename + '.html">' + page.title + '</a></li>\n';

        } else {
          // Add new section header
          if(inList) { toc += '  </ul>\n'; inList = false; }
          toc += '  <h4>' + page.section + '</h4>\n';
        }
      });

      toc += '</aside>\n';
      return toc;
    }

    var projects = []
    yaml.loadAll(fs.readFileSync(files.manifest, 'utf8'),
                 function(doc) { projects.push(doc); });

    // Make sure the output directory exists
    if(!fs.existsSync(paths.build)) { fs.mkdirSync(paths.build, '0775'); }
    if(!fs.existsSync(paths.rendered)) { fs.mkdirSync(paths.rendered, '0775'); }

    _.forEach(projects, function(project) {
      // Make sure a directory exists for the project
      var projectPath = paths.rendered + '/' + project.name;
      if(!fs.existsSync(projectPath)) { fs.mkdirSync(projectPath, '0775'); }

      _.forEach(project.versions, function(version) {
        // Make sure a directory exists for the language
        var langPath = projectPath + '/' + version.language;
        if(!fs.existsSync(langPath)) { fs.mkdirSync(langPath, '0775'); }

        // Make sure a directory exists for the version
        var versionName = _.isUndefined(version.tag) ? version.branch : version.tag;
        var versionPath = langPath + '/' + versionName;
        if(!fs.existsSync(versionPath)) { fs.mkdirSync(versionPath, '0775'); }

        // Write TOC
        fs.writeFileSync(versionPath + '/toc-guide.html', buildContents(version.guide));
        fs.writeFileSync(versionPath + '/toc-reference.html', buildContents(version.reference));
      });
    });
  });

  // Render the HTML-ized docs with templates and partials into finalized HTML files
  gulp.task('render-docpages', ['render-contents', 'render-markdown'], function() {
    var projects = []
    yaml.loadAll(fs.readFileSync(files.manifest, 'utf8'),
                 function(doc) { projects.push(doc); });

    // Make sure the website directory exists
    if(!fs.existsSync(paths.website)) { fs.mkdirSync(paths.website, '0775'); }

    _.forEach(projects, function(project) {
      // Make sure the build directory exists for the project
      var projectSrcPath = paths.rendered + '/' + project.name;
      var projectBuildPath = paths.website + '/' + project.name;
      if(!fs.existsSync(projectBuildPath)) { fs.mkdirSync(projectBuildPath, '0775'); }

      _.forEach(project.versions, function(version) {
        // Make sure the build directory exists for the language
        var langBuildPath = projectBuildPath + '/' + version.language;
        if(!fs.existsSync(langBuildPath)) { fs.mkdirSync(langBuildPath, '0775'); }

        // Make sure the build directory exists for the version
        version.name = _.isUndefined(version.tag) ? version.branch : version.tag;
        var versionBuildPath = langBuildPath + '/' + version.name;
        if(!fs.existsSync(versionBuildPath)) { fs.mkdirSync(versionBuildPath, '0775'); }

        var currentSection
        var srcDir = projectSrcPath + '/' + version.language + '/' + version.name + '/';
        var pathPrefix = project.name + '/' + version.language + '/' + version.name + '/';

        var groups = ['guide', 'reference']
        _.forEach(groups, function(group) {
          _.forEach(version[group], function(page) {
            if(_.isUndefined(page.section)) {
              gulp.src(files.docpage)
                  .pipe(replace(/@project/, project.name ))
                  .pipe(replace(/@fullTitle/, project.title))
                  .pipe(replace(/@pageTitle/, page.title))
                  .pipe(replace(/@language/, version.language))
                  .pipe(replace(/@version/, version.name))
                  .pipe(replace(/@group/, group))
                  .pipe(replace(/@section/, currentSection))
                  .pipe(replace(/@contents/, '../' + srcDir + 'toc-' + group + '.html'))
                  .pipe(replace(/@markdown/, '../' + srcDir + page.filename + '.html'))
                  .pipe(render('%%'))
                  .on('error', function(error) {
                     util.log('Error in', util.colors.cyan('render-docpages'), error.message);
                   })
                  .pipe(rename(pathPrefix + page.filename + '.html'))
                  .pipe(gulp.dest(paths.website));
            } else {
              // If it is a "section" entry, then just set the section and render nothing
              currentSection = page.section;
            }
          });
        });
      });
    });
  });

  // Renders the less files into a single css file
  gulp.task('render-less', function() {
    gulp.src(files.styles)
        .pipe(less())
        .on('error', function(error) {
           util.log('Error in', util.colors.cyan('render-less'), error.message);
         })
        .pipe(rename(function(path) { path.dirname += '/site/css' }))
        .pipe(gulp.dest(paths.build));
  });

  // Renders the static pages (home, license, etc..) from templates and partials
  gulp.task('render-static', function() {
    function buildPage(page) {
      gulp.src('site/' + page)
          .pipe(render({ prefix: '%%', basepath: process.cwd() + '/site' }))
          .on('error', function(error) {
             util.log('Error in', util.colors.cyan('render-static'), error.message);
           })
          .pipe(rename(page))
          .pipe(gulp.dest(paths.website));
    }

    buildPage('index.html');
    buildPage('license.html')
    buildPage('astron/index.html');
    buildPage('bamboo/index.html');
  });

  // Copy the javascript files to build
  gulp.task('copy-scripts', function() {
    return gulp.src(files.scripts)
               .pipe(changed(paths.website))
               .pipe(rename(function(path) { path.dirname += '/../js' }))
               .pipe(gulp.dest(paths.website));
  });

  // Copy the other resource files to build
  gulp.task('copy-resources', function() {
    return gulp.src(files.resources)
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
    gulp.src(paths.website)
        .pipe(webserver({
          open: true,
          port: 8080,
          livereload: true,
          fallback: 'index.html'
        }));
  });

  // Watch files and re-build as necessary while server is running
  gulp.task('watch', function() {
    gulp.watch(files.manifest,  ['render-docpages']);
    gulp.watch(files.markdown,  ['render-markdown', 'render-docpages']);
    gulp.watch(files.pages,     ['render-static']);
    gulp.watch(files.html,      ['render-static', 'render-docpages']);
    gulp.watch(files.less,      ['render-less']);
    gulp.watch(files.styles,    ['render-less']);
    gulp.watch(files.scripts,   ['copy-scripts']);
    gulp.watch(files.resources, ['copy-resources']);
  });
})();
