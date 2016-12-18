'use strict';
var Path = require('../path');
var should = require('should');
var ClickPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        if(config.selector===undefined){
            return ".click()";
        }
		if (config.selector == "xpath") {
            if(config.canNull===true){
                return `.elementByXPathOrNull("<%= xpath %>").then(function(e){
                    if(e){
                        return e.click();
                    }
                })`;
            }else{
                return '.elementByXPathOrNull("<%= xpath %>").click()';
            }
        } else if (config.selector == "className") {
            if(config.canNull===true){
                return `.elementByClassName("<%= className %>").then(function(e){
                    if(e){
                        return e.click();
                    }
                })`;
            }else{
                return '.elementByClassName("<%= className %>").click()';
            }
        } else if (config.selector == "name") {
            if(config.canNull===true){
                return `.elementByNameOrNullkeycode("<%= name %>").then(function(e){
                    if(e){
                        return e.click();
                    }
                })`;
            }else{
                return '.elementByName("<%= name %>").click()';
            }
        }else if(config.selector == "id") {
            if(config.canNull===true){
                return `.elementByIdOrNull("<%= id %>").then(function(e){
                    if(e){
                        return e.click();
                    }
                })`;
            }else{
                return '.elementById("<%= id %>").click()';
            }
        }
	},
	buildParams:function(config){
        if(config.selector===undefined){
            return {};
        }
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
        if(config.selector){
            config.should.have.property('selector').instanceOf(String).ok();
            if (config.selector !== 'xpath' && config.selector !== 'name' && 
                config.selector !== 'className' && config.selector !== 'id') {
                throw new Error('path.selector should in (xpath|name|className|id)');
            }
        }
        if(config.element){
            config.should.have.property('element').instanceOf(String).ok();
        }
        if(config.canNull!==undefined){
            config.canNull.should.instanceOf(Boolean);
        }
        ClickPlugin.__super__.checkConfig(config);
    }
});