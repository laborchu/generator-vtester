'use strict';
var Path = require('../path');
var should = require('should');
var ClickPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if (config.selector == "xpath") {
            return '.elementByXPathOrNull("<%= xpath %>").click()';
        } else if (config.selector == "className") {
            return '.elementByClassName("<%= className %>").click()';
        } else if (config.selector == "name") {
            return '.elementByName("<%= name %>").click()';
        }else if(config.selector == "id") {
            return '.elementById("<%= id %>").click()';
        }
	},
	buildParams:function(config){
		if (config.selector == "xpath") {
            return { 'xpath': config.element};
        } else if (config.selector == "className") {
            return { 'className': config.element};
        } else if (config.selector == "name") {
            return { 'name': config.element};
        } else if (config.selector == "id") {
            if(config.vtestConfig.platform==="android"){
                return { 'id': this.getAndroidResId(config,config.element)};
            }else{
                return { 'id': config.element};
            }
        }
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        if (config.selector !== 'xpath' && config.selector !== 'name' 
            && config.selector !== 'className' && config.selector !== 'id') {
            throw new Error('path.selector should in (xpath|name|className|id)');
        }
        ClickPlugin.__super__.checkConfig(config);
    }
});