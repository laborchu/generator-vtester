'use strict';
var Path = require('../path');
module.exports = Path.extend({
	getTemplate:function(config){
		return '.safeEval("var ue = UE.getEditor(\'<%= name %>\');ue.setContent(\'<%= value %>\')")';
	},
	buildParams:function(config){
		return { 'name': config.element ,'value': config.value };
	}
});