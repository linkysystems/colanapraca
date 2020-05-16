const gulp = require('gulp'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  path = require('path'),
  concat = require('gulp-concat'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  theme = require('./theme.js'),
  cleanCSS = require('gulp-clean-css');

const colors = theme.configs.colors;
const colorNames = Object.keys(colors);
const taskNames = [];

colorNames.forEach( (name)=> {
  const taskName = 'less_'+name;
  taskNames.push(taskName);

  gulp.task( taskName, function () {
    return gulp.src('./files/less/style-'+name+'.less')
    .pipe( sourcemaps.init() )
    .pipe(less({
      paths: [
        path.join(__dirname, 'files', 'less', name),
        path.join(__dirname, 'files', 'less', 'theme')
      ]
    }))
    // source code:
    .pipe(rename('style-'+name+'-source.css'))
    .pipe(gulp.dest('./files/public/'))
    // minifyed code:
    .pipe(rename('style-'+name+'.css'))
    .pipe(cleanCSS({
      level: { 1: { specialComments: 0 } },
      compatibility: 'ie8'
    }))
    .pipe(sourcemaps.write('./', {
      sourceMappingURLPrefix: '/public/theme/one-page-new-age'
    }))
    .pipe(gulp.dest('./files/public/'));
  });

  gulp.task(taskName+'_watch', function () {
    gulp.watch('files/less/**/*.less', [taskName]);
  });
});

// -- JS
const jsFiles = [
  path.join(__dirname, 'bower_components/matchHeight/dist/jquery.matchHeight.js'),
  path.join(__dirname, 'bower_components/bootstrap/dist/js/bootstrap.js'),
  path.join(__dirname, 'files', 'scripts', '**/*.js')
];

gulp.task('js', function() {
  return gulp.src(jsFiles)
  .pipe(concat('script.js'))
  .pipe(gulp.dest('./files/public/'))
  .pipe(rename('script.min.js'))
  .pipe(uglify())
  .pipe( gulp.dest('./files/public/') );
});

// -- Assets

gulp.task('fonts', function() {
  gulp.src('./bower_components/bootstrap/fonts/**/*')
  .pipe(gulp.dest('./files/public/fonts'));
});

// --

gulp.task('watch', function () {
  gulp.watch('files/less/**/*.less', ['less']);
});

gulp.task('less', taskNames);

gulp.task('default', ['less', 'js', 'fonts', 'watch']);