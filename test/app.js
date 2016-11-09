'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-vtester:build', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/build'))
      .withPrompts({someAnswer: true})
      .toPromise();
  });
  
  it('creates files', function () {
    
  });
  
});
