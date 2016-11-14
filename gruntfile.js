module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {

      dist: {

        src: ['dist']
      }
    },

    uglify: {

      dist: {

        files: {

          'dist/js/main.min.js': [
            'node_modules/d3/d3.min.js',
            'node_modules/d3-queue/build/d3-queue.min.js',
            'src/js/chart.js'
          ]
        }
      }
    },

    postcss: {

      options: {

        processors: [

          require('autoprefixer')({

            browsers: ['> 5%', 'last 2 versions', 'IE 7', 'IE 8', 'IE 9']
          }),

          require('cssnano')()
        ],

        map: true
      },

      dist: {

        files: {

          'dist/css/style.min.css': 'src/css/style.css'
        }
      }
    },

    copy: {

      dist: {

        files: [

          { expand: true, flatten: true, src: ['src/index.html'], dest: 'dist', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/preview.jpg'], dest: 'dist', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/data/*'], dest: 'dist/data', filter: 'isFile' }
        ]
      }
    },

    useminPrepare: {

      html: 'src/index.html'
    },

    usemin: {

      html: 'dist/index.html'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('dist', ['clean', 'useminPrepare', 'uglify', 'postcss', 'copy', 'usemin']);
};
