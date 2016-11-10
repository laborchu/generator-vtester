'use strict';
var Path = require('../path');
module.exports = Path.extend({
	getTemplate:function(config){
		if (config.selector == "xpath") {
            return '.elementByXPathOrNull("<%= xpath %>").click()';
        } else if (config.selector == "className") {
            return '.elementByClassName("<%= className %>").click()';
        }
	},
	buildParams:function(config){
		if (config.selector == "xpath") {
            return { 'xpath': config.element};
        } else if (config.selector == "className") {
            return { 'className': config.element};
        }
	}
});