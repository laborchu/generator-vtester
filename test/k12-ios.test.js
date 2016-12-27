'use strict';
var path = require('path');
var helpers = require('yeoman-test');

describe('generator-vtester:build', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/build'))
      .withOptions({ 
      	projectPath: '/Users/laborc/code/gitos/gitosx16/k12/k12-fsc-ios-vtester'
      })   
      .withPrompts({someAnswer: true})
      .toPromise();
  });

  it('build', function () {
  });
  
});
