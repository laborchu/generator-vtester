'use strict';
var Path = require('../path');
module.exports = Path.extend({
	getTemplate:function(config){
		return ".get('<%= url %>')";
	},
	buildParams:function(config){
		return { 'url': config.url };
	}
});