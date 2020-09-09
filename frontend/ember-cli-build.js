'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    sourcemaps: {
      enabled: EmberApp.env() !== 'production',
      extensions: ['js']
    },
    "ember-drag-drop-polyfill": {
      includeCSS: true,
      includeIconsCss: false,
      includeDebugCss: true,
      includeScrollBehavior: false,
    },
    babel: {
      sourceMaps: 'both'
    },
    fontawesome: {
      defaultPrefix: 'fal' // light icons
    },
    'ember-bootstrap': {
      bootstrapVersion: 4,
      importBootstrapFont: false,
      'importBootstrapCSS': false
    },

    svgJar: {
      sourceDirs: [
        'public/images/icons'
      ]
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('node_modules/h5p-standalone/dist/styles/h5p.css');
  app.import('public/bootstrap.css');

  return app.toTree();
};
