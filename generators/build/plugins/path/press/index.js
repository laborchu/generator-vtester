'use strict';
var Path = require('../path');
var should = require('should');
var PressPlugin = module.exports = Path.extend({
	getTemplate:function(config){
        if(config.selector===undefined){
            return ".touch('press',{duration: <%=value%>})";
        }
	},
	buildParams:function(config){
        var obj = {
            value:config.value
        };
		return obj;
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
        config.should.have.property('value').instanceOf(Number).ok();
        PressPlugin.__super__.checkConfig(config);
    }
});