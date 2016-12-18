'use strict';
var Checker = require('../checker');
var should = require('should');
var PropPlugin = module.exports = Checker.extend({
	getTemplate:function(config){
		if(config.vtestConfig.platform==="android"){
            return `.getProperty('description').then(function(desc){
                var descObj = JSON.parse(desc.description);
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
		if(config.vtestConfig.platform==="android"){
            let result = { 'key': config.key,'isExp':false, 'value': config.value,'op':config.op};
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
            throw new Error('filter.op should in (==|!=)');
        }
        PropPlugin.__super__.checkConfig(config);
    }
});