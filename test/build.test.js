'use strict';
var path = require('path');
var helpers = require('yeoman-test');

describe('generator-vtester:build', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/build'))
      .withOptions({ 
      	ucPath: '/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/uc/', 
      	ucDistPath : "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/dist/",
      	tplPath : "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/tpl/",
      	handlerPath : "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/handler/"
      })   
      .withPrompts({someAnswer: true})
      .toPromise();
  });

  it('build', function () {
  });
  
});
