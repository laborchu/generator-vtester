'use strict';
var Checker = require('../checker');
module.exports = Checker.extend({
	getTemplate:function(config){
		if (config.selector == "xpath") {
            return '.elementByXPathOrNull("<%= xpath %>").text().then(function(element) {"<%= value %>".should.equal(element);})';
        }
	},
	buildParams:function(config){
		if (config.selector == "xpath") {
            return { 'xpath': config.element, 'value': config.value};
        }
	}
});