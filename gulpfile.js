var gulp = require('gulp'),
    istanbul,
    jscs,
    jshint,
    mocha,
    plumber,
    stylish,
    tldr,

    PATH = {
        src: [ 'index.js', 'gulpfile.js', 'lib/**/*.js' ],
        test: 'test/*.js'
    }

if ( process.env.NODE_ENV !== 'production' ) {
    istanbul = require('gulp-istanbul')
    jscs = require('gulp-jscs')
    jshint = require('gulp-jshint')
    mocha = require('gulp-mocha')
    plumber = require('gulp-plumber')
    stylish = require('jshint-stylish')
    tldr = require('mocha-tldr-reporter')
}

gulp.task( 'default', [ 'checkstyle', 'test', 'watch' ] )

gulp.task( 'test', function() {
    return gulp.src( PATH.test )
        .pipe( plumber() )
        .pipe( mocha({ reporter: tldr }) )
})

gulp.task( 'checkstyle', function() {
    return gulp.src( [].concat( PATH.src, PATH.test ) )
        .pipe( plumber() )
        .pipe( jscs() )
        .pipe( jshint() )
        .pipe( jshint.reporter( stylish ) )
})

gulp.task( 'watch', function() {
    gulp.watch( [].concat( PATH.src, PATH.test ), [ 'checkstyle', 'test' ] )
})
