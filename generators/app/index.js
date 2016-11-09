'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
//var _ = require('lodash');
//var extend = require('deep-extend');
var mkdirp = require('mkdirp');


module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the praiseworthy ' + chalk.red('generator-vtester') + ' generator!'
    ));
    //设置交互信息
    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Please input project name:'
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  defaults: function () {
    if (path.basename(this.destinationPath()) !== this.props.projectName) {
      this.log(
        'Your generator must be inside a folder named ' + this.props.projectName + '\n' +
        'I\'ll automatically create this folder.'
      );
      mkdirp(this.props.projectName);
      this.destinationRoot(this.destinationPath(this.props.projectName));
    }
  },

  writing: function () {
    var pkg = this.fs.readJSON(this.templatePath('package.json'), {});
    pkg.name = this.props.projectName;
    pkg.description = this.props.projectDesc;
    pkg.main = this.props.projectName+".uc.js";
    pkg.author = this.props.projectAuthor;
    pkg.license = this.props.projectLicense;
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    this.fs.copy(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore')
    );
    this.fs.copy(
      this.templatePath('.jshintignore'),
      this.destinationPath('.jshintignore')
    );
    this.fs.copy(
      this.templatePath('.jshintrc'),
      this.destinationPath('.jshintrc')
    );
    this.fs.copy(
      this.templatePath('.npmignore'),
      this.destinationPath('.npmignore')
    );
    this.fs.copy(
      this.templatePath('.travis.yml'),
      this.destinationPath('.travis.yml')
    );
    this.fs.copy(
      this.templatePath('circle.yml'),
      this.destinationPath('circle.yml')
    );
    this.fs.copy(
      this.templatePath('HISTORY.md'),
      this.destinationPath('HISTORY.md')
    );
    this.fs.copy(
      this.templatePath('LICENSE'),
      this.destinationPath('LICENSE')
    );
    this.fs.copy(
      this.templatePath('Makefile'),
      this.destinationPath('Makefile')
    );
    this.fs.copy(
      this.templatePath('package.json'),
      this.destinationPath('package.json')
    );
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );

    this.fs.copy(
      this.templatePath('src/main.uc.js'),
      this.destinationPath('src/'+pkg.main)
    );
    this.fs.copy(
      this.templatePath('src/global.uc.js'),
      this.destinationPath('src/global.uc.js')
    );

    mkdirp(this.destinationPath('test/'));
    mkdirp(this.destinationPath('src/handler'));
    mkdirp(this.destinationPath('src/uc'));
  },

  install: function () {
    this.installDependencies({bower: false});
  }
});
