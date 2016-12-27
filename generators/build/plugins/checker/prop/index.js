'use strict';
var Checker = require('../checker');
var should = require('should');
var PropPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		if(config.vtestConfig.platform==="android"||config.vtestConfig.platform==="ios"){
            return `.getProperty('<%=target%>').then(function(desc){
                <%if(target=="description"){%>
                var descObj = JSON.parse(desc.description)
                <%}else if(target=="value"){%>
                var descObj = JSON.parse(desc);
                <%}%>

                <%if(isExp){%>
                    let value = <%=value%>;
                <%}else{%> 
                    let value = '<%=value%>';
                <%}%> 
                if(!(descObj['<%=key%>']<%=op%>value)){
                    throw new Error(descObj['<%=key%>']+' not <%=op%> ' + value);
                }
                return this;
            })`;
        }
    },
	buildParams:function(config){
		if(config.vtestConfig.platform==="android"||config.vtestConfig.platform==="ios"){
            let result = { 'key': config.key,'isExp':false, 'value': config.value,'op':config.op,'target':config.target};
            if (typeof config.value === 'string' || config.value instanceof String){
                if(config.value.startsWith("${")&&config.value.endsWith("}")){
                    result.isExp = true;
                    result.value = config.value.replace("${","").replace("}","");
                }
            }
            return result;
        }else{
            return { 'key': config.key, 'value': config.value};
        }
	},
    checkConfig : function(config){
        config.should.have.property('key').instanceOf(String).ok();
        config.should.have.property('value');
        if (config.op !== '=='&&config.op !== '!=') {
            throw new Error('op should in (==|!=)');
        }
        if (config.target) {
            config.target.should.instanceOf(String).ok();
            if (config.target !== 'description' && 
                config.target !== 'value') {
                throw new Error('target should in (description|value)');
            }
        }else{
            config.target = 'description';
        }
        PropPlugin.__super__.checkConfig(config);
    }
});