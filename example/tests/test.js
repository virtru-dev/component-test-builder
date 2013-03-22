var devMessage = require('../dev');
var assert = require('chai').assert;

describe('Component Tests', function() {
  it('import main', function() {
    var index = require('../index');
    assert.equal(index.message(), 'message');
  });
  it('import another.js', function() {
    var another = require('../another');
    assert.equal(another(), 'another message');
  });
});
