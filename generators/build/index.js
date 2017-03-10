"use strict";
let yeoman = require('yeoman-generator');
let chalk = require('chalk');
let yosay = require('yosay');
let path = require('path');
let Vtester = require('vtester-core');


module.exports = yeoman.Base.extend({

    prompting: function () {
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the praiseworthy ' + chalk.red('generator-vtester') + ' generator!'
        ));
        //设置交互信息
        var prompts = [];
        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },

    defaults: function () {
        if (this.options.projectPath) {
            this.projectPath = path.join(this.options.projectPath);
            this.tplPath = this.templatePath();
        } else {
            this.projectPath = this.destinationPath();
            this.tplPath = this.templatePath();
        }
    },

  

    writing: function () {
        let vtester = new Vtester();
        vtester.build(this.projectPath);
    }

});
