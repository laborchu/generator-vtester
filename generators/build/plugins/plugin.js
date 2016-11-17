'use strict';
var _ = require('lodash');
var should = require('should');
var Plugin = module.exports = function(){

};
Plugin.prototype.init = function(name){
	this.name = name;
};

Plugin.prototype.getTemplate = function(config){
	throw new Error("please override getTemplate function");
};
Plugin.prototype.buildParams = function(config){
	throw new Error("please override buildParams function");
};
Plugin.prototype.build = function(config){
    var compiled = _.template(this.getTemplate(config));
    return compiled(this.buildParams(config));
};
Plugin.prototype.checkConfig = function(config){
    if (config.hasOwnProperty('sleep')) {
        should(config.sleep).instanceOf(Number);
    }
};
Plugin.extend = require('class-extend').extend;