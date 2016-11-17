'use strict';
var Path = require('../path');
var should = require('should');
var InputPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if (config.selector == "name") {
			return '.elementByName("<%= name %>").clear().sendKeys("<%= value %>")';
		}
	},
	buildParams:function(config){
		if (config.selector == "name") {
			return { 'name': config.element, 'value': config.value };
		}
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        if (config.selector !== 'xpath' && config.selector !== 'name' && config.selector !== 'className') {
            throw new Error('path.selector should in (xpath|name|className)');
        }
        config.should.have.property('value').instanceOf(String);
        InputPlugin.__super__.checkConfig(config);
    }
});