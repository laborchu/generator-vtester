'use strict';
var Path = require('../path');
var should = require('should');
var GetPlugin = module.exports = Path.extend({
	getTemplate:function(config){
		if(config.selector == "id") {
            return `.elementsById("<%= id %>").then(function(elements){
                should(elements).be.not.empty();
                let value = "";
                <%if(filter){%>
                    <%if(isExp){%>
                        value = <%=filter.value%>;
                    <%}else{%> 
                        value = '<%=filter.value%>';
                    <%}%> 
                <%}%> 
                var error = "<%=error%>";
                if(error==""){
                    <%if(filter){%>
                        error = 'not found <%=filter.property%> <%=filter.op%> '+value+' element';
                    <%}%> 
                }
                var call = function(index){
                    <%if(mode=='first'){%>
                        if(elements.length==index){
                            throw new Error(error)
                        }
                    <%}else{%> 
                        if(-1==index){
                            throw new Error(error)
                        }
                    <%}%>
                    <%if(filter){%>
                        return elements[index].getProperty('<%=filter.target%>').then(function(desc){
                            let cmpV = "";
                            let cacheV;
                            <%if(filter.target=="description"){%>
                                cacheV = JSON.parse(desc.description);
                                cmpV = descObj['<%=filter.property%>']
                            <%}else{%>
                                cmpV = desc.text;
                                cacheV = desc.text;
                            <%}%>

                            <%if(cacheElement){%>
                                driver.cacheElements.push(elements[index]);
                            <%}%>
                            <%if(cacheDesc){%>
                                driver.cacheDescs.push(cacheV);
                            <%}%>

                            if(cmpV<%=filter.op%>value){
                                return elements[index];
                            }else{
                                <%if(mode=='first'){%>
                                    return call(++index);
                                <%}else{%> 
                                    return call(--index);
                                <%}%>
                            }
                            
                        })
                    <%}else{%> 
                        <%if(cacheDesc){%>
                            return elements[index].getProperty('description').then(function(desc){
                                var descObj = JSON.parse(desc.description);
                                driver.cacheDescs.push(descObj);
                                return elements[index];
                            })
                        <%}else{%> 
                            return elements[index];
                        <%}%>
                    <%}%>
                }
                if(elements.length>0){
                    <%if(mode=='first'){%>
                        return call(0);
                    <%}else{%> 
                        return call(elements.length-1);
                    <%}%>
                }
            })`;
        }
	},
	buildParams:function(config){
		if(config.selector == "id"){
            var cacheElement = config.cacheElement||false;
            var cacheDesc = config.cacheDesc||false;
            var mode = config.mode||'first';
            var error = config.error||'';
			 if(config.vtestConfig.platform==="android"){
                var result = { 
                    'id': this.getAndroidResId(config,config.element),
                    'mode':mode, 
                    'filter':null, 
                    'error':error, 
                    'cacheElement':cacheElement,
                    'cacheDesc':cacheDesc,
                    'isExp':false
                };
                if(config.filter){
                    result.filter = config.filter;
                    if (typeof config.filter.value === 'string' || config.filter.value instanceof String){
                        if(config.filter.value.startsWith("${")&&config.filter.value.endsWith("}")){
                            result.isExp = true;
                            result.filter.value = config.filter.value.replace("${","").replace("}","");
                        }
                        if(!result.filter.target){
                            result.filter.target = "description";
                        }
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
            throw new Error('config.selector should in (id)');
        }
        if (config.cacheElement !== undefined) {
            config.should.have.property('cacheElement').instanceOf(Boolean).ok();
        }
        if (config.cacheDesc !== undefined) {
            config.should.have.property('cacheDesc').instanceOf(Boolean).ok();
        }
        if(config.filter){
            config.filter.should.have.property('op').instanceOf(String).ok();
            config.filter.should.have.property('value');
            if (config.filter.op !== '=='&&config.filter.op !== '>') {
                throw new Error('filter.op should in (==|>)');
            }
            if (config.filter.target) {
                config.filter.target.should.instanceOf(String).ok();
                if (config.filter.target !== 'description'&&config.filter.target !== 'text') {
                    throw new Error('filter.target should in (description|text)');
                }
            }else{
                config.filter.target = 'description';
            }
            if(config.filter.target=='description'){
                config.filter.should.have.property('property').instanceOf(String).ok();
            }
            
        }
        if(config.mode){
            if (config.mode !== 'first'&&config.mode !== 'last') {
                throw new Error('config.mode should in (first|last)');
            }
        }
        GetPlugin.__super__.checkConfig(config);
    }
});