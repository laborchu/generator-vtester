'use strict';
var Path = require('../path');
module.exports = Path.extend({
	getTemplate:function(config){
		if (config.selector == "name") {
			return '.elementByName("<%= name %>").clear().sendKeys("<%= value %>")';
		}
	},
	buildParams:function(config){
		if (config.selector == "name") {
			return { 'name': config.element, 'value': config.value };
		}
	}
});