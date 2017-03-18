module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        files: {
          'assets/scss/build/app.css' : 'assets/scss/app.scss'
        }
      }
    },

    cssmin: {
      my_target: {
        files: [{
          expand: true,
          cwd: 'assets/scss/build/',
          src: ['app.css'], // 1
          dest: 'public/css/',
          ext: '.min.css'
        }]
      }
    },

    uglify: {
      build : {
        files : {
          'public/js/app.min.js' : [
            // bower components
            'components/jquery/dist/jquery.js',
            'components/underscore/underscore.js',
            'components/ejs/ejs.js',

            // everything else
            'assets/js/*.js'
          ],
        }
      }
    },

    watch: {
      css: {
        files: 'assets/scss/*.scss',
        tasks: ['sass', 'cssmin']
      },
      js: {
        files: 'assets/js/**/*.js',
        tasks: ['uglify']
      }
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // register at least this one task
  grunt.registerTask('default', ['uglify', 'sass']);
}