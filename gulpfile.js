///
/// Dependencies
///

var gulp          = require( 'gulp' );
var rename        = require( 'gulp-rename' );
var insert        = require( 'gulp-insert' );
var browserSync   = require( 'browser-sync' );
var webpack       = require( 'webpack-stream' );
var uglify        = require( 'gulp-uglify' );
var sass          = require( 'gulp-sass' );
var postcss       = require( 'gulp-postcss' );
var autoprefixer  = require( 'autoprefixer' );
var cssnano       = require( 'cssnano' );
var theo          = require( 'theo' );


///
/// Local variables
///

var strings = {
  VERSION: '/*! Apollo JS v0.1.0-dev */'
};


///
/// Development server
///

gulp.task( 'server', function() {
  browserSync.init({
    server: 'dist',
    ghostMode: false
  });
});


///
/// Watch files
///

gulp.task( 'watch', function() {
  gulp.watch( 'scss/**/*.scss', [ 'apollo-styles' ]);
  gulp.watch( 'js/**/*.js', [ 'apollo-scripts' ]);
  gulp.watch( 'docs/**/*.html', [ 'docs' ] );
  gulp.watch( 'docs/_scss/**/*.scss', [ 'docs-styles' ]);
})


///
/// JS bundler
///

///
/// TODO: Figure out what to do with webpack hash
/// for bundle
///

gulp.task( 'apollo-scripts', function() {
  gulp.src( 'js/apollo.js' )
    .pipe( webpack({
      output: {
        filename: 'apollo.js'
      }
    }))
    .pipe( gulp.dest( 'dist/js/' ))
    .pipe( uglify() )
    .pipe( insert.prepend( strings.VERSION ))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( 'dist/js/' ))
    .pipe( browserSync.stream() );
});

///
/// SCSS compilation
///

gulp.task( 'apollo-styles', function () {
  gulp.src( 'scss/apollo.scss' )
    .pipe( sass({
        includePaths: [ 'node_modules' ],
        outputStyle: 'expanded'  // expanded for development
      })
      .on( 'error', sass.logError ))
    .pipe( postcss([
      autoprefixer({
        browsers: [ 'last 2 versions' ]
      })
    ]))
    .pipe( gulp.dest( 'dist/css/' ))
    .pipe( browserSync.stream() )
    .pipe( postcss([ cssnano() ]))
    .pipe( rename({
      suffix: '.min'
    }))
    .pipe( gulp.dest( 'dist/css/' ))
    .pipe( browserSync.stream() );
});

gulp.task( 'docs-styles', function () {
  gulp.src( 'docs/_scss/docs.scss' )
    .pipe( sass({
        includePaths: [ 'node_modules' ],
        outputStyle: 'expanded'  // expanded for development
      })
      .on( 'error', sass.logError ))
    .pipe( postcss([
      autoprefixer({
        browsers: [ 'last 2 versions' ]
      })
    ]))
    .pipe( gulp.dest( 'dist/css/' ))
    .pipe( browserSync.stream() );
});


///
/// Documentation static site generator
///

gulp.task( 'docs', [ 'jekyll' ], function() {
  gulp.src( 'docs-temp/**/*.html' )
    .pipe( gulp.dest( 'dist' ) )
    .pipe( browserSync.stream() );
});


gulp.task( 'jekyll', function ( gulpCallBack ) {
  var exec = require( 'child_process' ).exec;

  exec( 'jekyll build', function( err, stdout, stderr ) {
    console.log( stdout );
    console.error( stderr );
    gulpCallBack( err );
  });
});


///
/// Theo transformations
///

gulp.task( 'theo-colors', function() {
  gulp.src( 'theo/_color-variables.json')
    .pipe( theo.plugins.transform( 'web' ))
    .pipe( theo.plugins.format( 'scss' ))
    .pipe( gulp.dest( 'scss' ));
});

gulp.task( 'theo-icons-sass', function() {
  gulp.src( 'theo/icons.json')
    .pipe( theo.plugins.transform( 'raw' ))
    .pipe( theo.plugins.format( 'map.scss' ))
    .pipe( gulp.dest( 'scss' ));
});

gulp.task( 'theo-icons-json', function() {
  gulp.src( 'theo/icons.json')
    .pipe( theo.plugins.transform( 'raw' ))
    .pipe( theo.plugins.format( 'json' ))
    .pipe( gulp.dest( 'docs/_data' ));
});


///
/// Conglomerate tasks
///

gulp.task( 'theo', [ 'theo-colors', 'theo-icons-sass', 'theo-icons-json' ]);
gulp.task( 'default', [ 'apollo-styles', 'apollo-scripts', 'docs-styles', 'docs' ]);
gulp.task( 'serve', [ 'default', 'server', 'watch' ]);
