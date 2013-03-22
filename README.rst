component-test-builder - Write tests easily with component
==========================================================

This is a custom builder for component that does everything the vanilla builder
does and also adds scripts listed in ``devScripts`` and scripts listed in
``testScripts``. It then generates two script files ``build/test-build.js`` and
``build/test-loader.js``. ``test-build.js`` includes the build of the
components with dev and test scripts. ``test-loader.js`` requires all the
``testScripts`` so that all the tests can be imported and run, this is
particularly useful for mocha tests.

Building
--------

Building is trivial. Simply type this command::
    
    component test-build

Mocha Example
-------------

To run all of your tests with mocha. Simply add script and style tags for mocha
and script tags that include ``build/test-build.js`` and
``build/test-loader.js``. The basic html test runner would be as follows::
    
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mocha Tests</title>
      <link rel="stylesheet" href="mocha.css" />
    </head>
    <body>
      <div id="mocha"></div>
      <script src="mocha.js"></script>
      <script>mocha.setup('bdd')</script>
      <script src="build/test-build.js"></script>
      <script src="build/test-loader.js"></script>
      <script>
        mocha.run();
      </script>
    </body>
    </html>

Using with a test runner like Karma
-----------------------------------

The test builder can also be used with something like Karma. More details will come soon.
