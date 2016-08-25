module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {

      // define the files to lint
      files: ['Gruntfile.js', 'src/**/*.js'],

      options: {
        // globals: {
        //   jQuery: true,
        //   console: true,
        //   module: true
        // },
        reporter: require('jshint-stylish')
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> | <%= pkg.author %> | <%= pkg.license_url %> */\n'
      },
      dist: {
        files: {
          'dist/js/<%= pkg.name %>.min.js': ['src/js/<%= pkg.name %>.js']
        }
      }
    },

    cssmin: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['*.css', '!*.min.css'],
          dest: 'dist/css',
          ext: '.min.css'
        }]
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, cwd: 'src/locale/', src: ['**'], dest: 'dist/locale'},
          {src: ['src/js/jcookie-banner-loader.js'], dest: 'dist/js/jcookie-banner-loader.js', filter: 'isFile'},
        ],
      },
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'cssmin', 'copy']);

};