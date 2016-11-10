'use strict';
var Checker = require('../checker');
module.exports = Checker.extend({
	getTemplate:function(config){
		if (config.selector == "xpath") {
            return '.elementsByXPath("<%= xpath %>").then(function(els) {\
            	return els.reduce(function (prev, el) {\
            		return prev.then(function() {\
            			return el.text().then(function(text){\
            				[<%= value %>].should.containEql(text);\
            			});\
            		});\
            	},Promise.resolve());\
            })';
        }
	},
	buildParams:function(config){
		if (config.selector == "xpath") {
            return { 'xpath': config.element, 'value': config.value};
        }
	}
});