const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();
const nunjucks = require('nunjucks');

let customEnv = new nunjucks.Environment();
customEnv.addFilter('shorten', function(str, count) {
  return str.slice(0, count || 3);
});
let dev = false;

function errorlog (error) {  
  console.error.bind(error);  
  this.emit('end');  
}  

function requireUncached( $module ) {
  delete require.cache[require.resolve( $module )];
  return require( $module );
}

// Sass Task
gulp.task('sass', function () {  
  return gulp.src('templates/code/scss/*.scss')  
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass({
      outputStyle: 'compressed', 
      precision: 7
    }).on('error', $.sass.logError))  
    .pipe($.cached('sass'))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream());
});

// scss to njk
gulp.task('scssToNjk', function () {
  return gulp.src('templates/code/scss/*.scss')
    .pipe($.plumber())
    .pipe($.change(function(content) {
      return content.replace(/(\/\/=>\s+)/g, '');
    }))
    .pipe($.rename({extname: '.njk'}))
    .pipe($.cached('scssToNjk'))
    .pipe(gulp.dest('templates/code/scss'));
});

// yml to json
gulp.task('ymlToJson', function () {
  return gulp.src('templates/code/*.yml')
    .pipe($.yaml({space: 2}))
    .pipe(gulp.dest('templates/code'));
});

// Nunjucks Task
gulp.task('html', function() {
  let data = requireUncached('./' + 'templates/code/data.json');

  data.is = function (type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  };

  data.keys = function (obj) {
    return Object.keys(obj);
  };

  return gulp.src('templates/*.njk')
    .pipe($.nunjucks.compile(data, {
      watch: true,
      noCache: true,
      // env: customEnv,
    }))
    .pipe($.rename(function (path) { path.extname = ".html"; }))
    .pipe($.if(dev, $.htmltidy({
      doctype: 'html5',
      wrap: 0,
      hideComments: true,
      indent: true,
      'indent-attributes': false,
      'drop-empty-elements': false,
      'force-output': true
    }), $.htmlmin({
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      collapseBooleanAttributes: true,
      decodeEntities: true,
      minifyCSS: true,
      minifyJs: true,
      removeComments: true,
    })))
    .pipe($.cached('nunjucks'))
    .pipe(gulp.dest('.'));
});

// Server Task
gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
    open: false,
    notify: false
  });

  gulp.watch(['templates/code/*.yml'], ['ymlToJson']);
  gulp.watch(['templates/**/*.scss'], ['scssToNjk', 'sass']);
  gulp.watch(['templates/**/*.njk', 'templates/**/*.json'], ['html']);
  gulp.watch(['*.html', 'assets/css/*.css', 'assets/js/*.js']).on('change', browserSync.reload);
});

gulp.task('default', [
  // 'ymlToJson'
  // 'html',
  'server',
]);