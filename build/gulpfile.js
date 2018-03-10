var gp = require('gulp')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')

gp.task('pkg', function () {
  gp.src(
    ['../src/util.js',
      '../src/headers.js',
      '../src/abortController.js',
      '../src/interceptor.js',
      '../src/request.js',
      '../src/response.js',
      '../src/constructor.js',
      '../src/index.js',
      '../index.js']
  )
  .pipe(concat('xe-ajax1.js'))
  .pipe(gp.dest('../dist'))
  .pipe(uglify())
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gp.dest('../dist'))
})
