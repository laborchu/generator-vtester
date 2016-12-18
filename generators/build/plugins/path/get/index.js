'use strict';
var Path = require('../path');
var should = require('should');
var GetPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if(config.selector == "id") {
            return `.elementsById("<%= id %>").then(function(elements){
                <%if(isExp){%>
                    let value = <%=filter.value%>;
                <%}else{%> 
                    let value = '<%=filter.value%>';
                <%}%> 
                var call = function(index){
                    if(elements.length==index){
                        return;
                    }
                    return elements[index].getProperty('description').then(function(desc){
                        var descObj = JSON.parse(desc.description);
                        if(descObj['<%=filter.property%>']<%=filter.op%>value){
                            <%if(cacheElement){%>
                                driver.cacheElements.push(elements[index]);
                            <%}%>
                            <%if(cacheDesc){%>
                                driver.cacheDescs.push(descObj);
                            <%}%>
                            return elements[index];
                        }else{
                            return call(++index);
                        }
                        
                    })
                }
                if(elements.length>0){
                    return call(0);
                }
            })`;
        }
	},
	buildParams:function(config){
		if(config.selector == "id"){
            var cacheElement = config.cacheElement||false;
            var cacheDesc = config.cacheDesc||false;
			 if(config.vtestConfig.platform==="android"){
                var result = { 
                    'id': this.getAndroidResId(config,config.element), 
                    'value': config.value,
                    'filter':config.filter,
                    'cacheElement':cacheElement,
                    'cacheDesc':cacheDesc,
                    'isExp':false
                };
                if (typeof config.filter.value === 'string' || config.filter.value instanceof String){
                    if(config.filter.value.startsWith("${")&&config.filter.value.endsWith("}")){
                        result.isExp = true;
                        result.filter.value = config.filter.value.replace("${","").replace("}","");
                    }
                }
                return result;
            }else{
                return { 'id': config.element, 'value': config.value};
            }
		}
	},
    checkConfig : function(config){
        config.should.have.property('selector').instanceOf(String).ok();
        config.should.have.property('element').instanceOf(String).ok();
        if (config.selector !== 'id') {
            throw new Error('path.selector should in (id)');
        }
        if (config.cacheElement !== undefined) {
            config.should.have.property('cacheElement').instanceOf(Boolean).ok();
        }
        if (config.cacheDesc !== undefined) {
            config.should.have.property('cacheDesc').instanceOf(Boolean).ok();
        }
        if(config.filter){
            config.filter.should.have.property('property').instanceOf(String).ok();
            config.filter.should.have.property('op').instanceOf(String).ok();
            config.filter.should.have.property('value');
            if (config.filter.op !== '=='&&config.filter.op !== '>') {
                throw new Error('filter.op should in (==|>)');
            }
        }
        GetPlugin.__super__.checkConfig(config);
    }
});