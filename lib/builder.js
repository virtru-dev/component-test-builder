var util = require('util'),
    _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    Builder = require('component-builder');

function buildTests(directory) {
  var directory = path.resolve(directory);
  ComponentTestBuilder.run(directory);
}

exports.buildTests = buildTests;

function ensureBuildDir(directory) {
  if(!fs.existsSync(directory)) {
    // Make the directory
    fs.mkdirSync(directory);
  } else {
    var stat = fs.statSync(directory);
    if(!stat.isDirectory()) {
      throw new Error(util.format('Expected build path, "%s", is not a directory', directory));
    }
  }
}

function addScripts(directory, builder, scripts) {
  scripts.forEach(function(script) {
    var scriptPath = path.resolve(directory, script);
    var scriptSrc = fs.readFileSync(scriptPath, { encoding: 'utf-8' });
    builder.addFile('scripts', script, scriptSrc);
  });
}

/**
 * Not to be run internally. Used for generated code
 */
function loadTests(prefix, requireStrings) {
  for(var i = 0; i < requireStrings.length; i++) {
    var requireString = requireStrings[i];
    require(prefix + '/' + requireString);
  }
}

/**
 * A test runner for javascript packages built with component and tested with
 * karma
 */
function ComponentTestBuilder(directory, config) {
  this.config = config;
  this._directory = directory;
}

ComponentTestBuilder.run = function(directory) {
  var configPath = path.resolve(directory, 'component.json');
  try {
    var jsonString = fs.readFileSync(configPath, { encoding: 'utf-8' });
    var config = JSON.parse(jsonString);
  } catch(e) {
    console.log("Invalid JSON file " + e);
    process.exit(1);
  }
  var builder = new ComponentTestBuilder(directory, config);
  builder.build();
};

ComponentTestBuilder.prototype.build = function() {
  var config = this.config;
  var directory = this._directory;
  // Dev scripts are additional dev tools you may need
  var devScripts = config.devScripts || []; 
  // Tests are modules that will be automatically required by a test module
  // called run-tests
  var testScripts = config.testScripts || []; 
  // Runs the builder and adds all of the tests and dev scripts into the build as well.
  var builder = new Builder(directory);
  builder.conf = config;
  builder.prefixUrls('./');
  builder.addSourceURLs(true);
  builder.development(true);
  // Add local paths to the lookup
  _.each(config.paths, function(lookupPath) {
    builder.addLookup(lookupPath);
  });
  // Add dev scripts
  addScripts(directory, builder, devScripts);
  // Add test scripts
  addScripts(directory, builder, testScripts);
  // Run the builder
  var self = this;
  builder.build(function(err, obj) {
    if(err) {
      throw err;
    }
    var buildDirectory = path.resolve(directory, 'build')
    ensureBuildDir(buildDirectory);

    var jsOutputPath = path.resolve(buildDirectory, 'test-build.js');
    var cssOutputPath = path.resolve(buildDirectory, 'test-build.css');
    var jsOutput = '';
    jsOutput += obj.require;
    jsOutput += obj.js;
    fs.writeFileSync(jsOutputPath, jsOutput);
    fs.writeFileSync(cssOutputPath, obj.css);
    var loaderOutputPath = path.resolve(buildDirectory, 'test-loader.js');
    self.createLoaderFile(testScripts, loaderOutputPath);
  });
};

ComponentTestBuilder.prototype.createLoaderFile = function(testScripts, outputPath) {
  var testScriptArraySrc = JSON.stringify(testScripts);
  var loadTestsSrc = loadTests.toString();
  var srcTemplate = "(function() {\nvar testScripts = %s, prefix = '%s';\n%s\nloadTests(prefix, testScripts);\n})();\n";
  var loaderSrc = util.format(srcTemplate, testScriptArraySrc, this.config.name, loadTestsSrc);
  fs.writeFileSync(outputPath, loaderSrc);
};
