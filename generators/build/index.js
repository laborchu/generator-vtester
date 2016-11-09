/*jslint node: true */
"use strict";
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');

var ItBuilder = function() {
    this.itContent = "return driver";
};
ItBuilder.prototype.goUrl = function(url) {
    var compiled = _.template(".get('<%= url %>')");
    this.itContent = this.itContent.concat(compiled({ 'url': url }));
    return this;
};
ItBuilder.prototype.clickElementByXPath = function(xpath) {
    var compiled = _.template('.elementByXPathOrNull("<%= xpath %>").click()');
    this.itContent = this.itContent.concat(compiled({ 'xpath': xpath }));
    return this;
};
ItBuilder.prototype.clickElementByClassName = function(className) {
    var compiled = _.template('.elementByClassName("<%= className %>").click()');
    this.itContent = this.itContent.concat(compiled({ 'className': className }));
    return this;
};

ItBuilder.prototype.inputElementByName = function(name, value) {
    var compiled = _.template('.elementByName("<%= name %>").clear().sendKeys("<%= value %>")');
    this.itContent = this.itContent.concat(compiled({ 'name': name, 'value': value }));
    return this;
};
ItBuilder.prototype.eqElementByXPath = function(xpath, value) {
    var compiled = _.template('.elementByXPathOrNull("<%= xpath %>").text().then(function(element) {"<%= value %>".should.equal(element);})');
    this.itContent = this.itContent.concat(compiled({ 'xpath': xpath, 'value': value }));
    return this;
};
ItBuilder.prototype.eqsElementsByXPath = function(xpath, value) {
    var compiled = _.template('.elementsByXPath("<%= xpath %>").then(function(els) {return els.reduce(function (prev, el) {return prev.then(function() {return el.text().then(function(text){[<%= value %>].should.containEql(text);});});}, Promise.resolve());})');
    this.itContent = this.itContent.concat(compiled({ 'xpath': xpath, 'value': value }));
    return this;
};
ItBuilder.prototype.stopElementByXPath = function(xpath, value, stopBuilder) {
    var compiled = _.template('.elementByXPathOrNull("<%= xpath %>").text().then(function(element) {if((element?element:"")!="<%= value %>"){<%= body %>}})');
    this.itContent = this.itContent.concat(compiled({ 'xpath': xpath, 'value': value, 'body': stopBuilder.toString() }));
    return this;
};
ItBuilder.prototype.checkAjax = function(url, doer) {
    var compiled = _.template('.elementByXPathOrNull("//div[contains(@class, \'ajax-result\')]/div[@data-url=\'<%= url %>\'][last()]").getAttribute("data-res").then(function(element) {handler.<%= doer %>(element)})');
    this.itContent = this.itContent.concat(compiled({ 'url': url, 'doer': doer}));
    return this;
};
ItBuilder.prototype.sleep = function(time) {
    var compiled = _.template(".sleep(<%= time %>)");
    this.itContent = this.itContent.concat(compiled({ 'time': time }));
    return this;
};
ItBuilder.prototype.toString = function() {
    return this.itContent;
};


module.exports = yeoman.Base.extend({

    prompting: function() {
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the praiseworthy ' + chalk.red('generator-vtester') + ' generator!'
        ));
        //设置交互信息
        var prompts = [];
        return this.prompt(prompts).then(function(props) {
            this.props = props;
        }.bind(this));
    },

    defaults: function() {
        this.ucPath = "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/uc/";
        this.ucDistPath = "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/dist/";
        this.tplPath = "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/tpl/";
        this.handlerPath = "/Users/laborc/code/gitos/gitosx16/k12/k12-os-vtester/src/handler/";
        // this.ucPath = this.destinationPath()+"/src/uc/";
        // this.ucDistPath = this.destinationPath()+"/src/dist/";
        // this.handlerPath = this.destinationPath()+"/src/handler/";
        // this.tplPath = this.templatePath();
    },

    _iteratorUc: function(itCache, children) {
        var self = this;
        children.forEach(child => {
            if (child.itKey) {
                itCache[child.itKey] = child;
            }
            if (child.children && _.isArray(child.children)) {
                self._iteratorUc(itCache, child.children);
            }
        });
    },

    _buildPath: function(index, paths, builder) {
        var self = this;
        var step = paths[index];
        if (step.type == "url") {
            builder.goUrl(step.url);
        } else if (step.type == "click") {
            if (step.selector == "xpath") {
                builder.clickElementByXPath(step.element);
            } else if (step.selector == "className") {
                builder.clickElementByClassName(step.element);
            }
        } else if (step.type == "input") {
            if (step.selector == "name") {
                builder.inputElementByName(step.element, step.value);
            }
        }

        if (step.sleep && step.sleep > 0) {
            builder.sleep(step.sleep);
        }

        var goNext = function(targetBuilder) {
            if (paths.length > (index + 1)) {
                self._buildPath(index + 1, paths, targetBuilder);
            }
        };

        if (step.checking) {
            var hasStop = false;
            Object.keys(step.checking).forEach(function(key) {
                var checkData = step.checking[key];
                if (key == "stop") {
                    hasStop = true;
                    if (checkData.selector == "xpath") {
                        var stopBuilder = new ItBuilder();
                        goNext(stopBuilder);
                        builder.stopElementByXPath(checkData.element, checkData.value, stopBuilder);
                    }
                } else if (key == "eq") {
                    if (checkData.selector == "xpath") {
                        builder.eqElementByXPath(checkData.element, checkData.value);
                    }
                } else if (key == "eqs") {
                    if (checkData.selector == "xpath") {
                        builder.eqsElementsByXPath(checkData.element, checkData.value);
                    }
                } else if (key == "ajax") {
                        builder.checkAjax(checkData.url, checkData.doer);
                }
                if (checkData.sleep && checkData.sleep > 0) {
                    builder.sleep(checkData.sleep);
                }
            });
            if (!hasStop) {
                goNext(builder);
            }
        } else {
            goNext(builder);
        }

    },

    _buildUc: function(itCache, uc) {
        var self = this;
        //处理前置uc
        var preTplStr = "";
        if (uc.preUc) {
            if (!_.isString(uc.preUc)) {
                self.log(uc.preUc + " should is string");
            } else if (!itCache[uc.preUc]) {
                self.log(uc.preUc + " not find uc");
            } else {
                preTplStr = self._buildUc(itCache, itCache[uc.preUc]);
            }
        }
        //处理uc
        var params = { "title": uc.title };
        var readmeTpl;
        var content = "";
        if (uc.children && _.isArray(uc.children)) {
            
            uc.children.forEach(child => {
                var it = self._buildUc(itCache, child);
                content = content.concat(it);
            });
            params.body = content;
            readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "describe.tpl.js")));
        } else {
            content = "";
            if (uc.paths && _.isArray(uc.paths)) {
                var builder = new ItBuilder();
                self._buildPath(0, uc.paths, builder);
                if (uc.sleep && uc.sleep > 0) {
                    builder.sleep(uc.sleep);
                }
                content = builder.toString();
            }
            params.body = content;
            if(uc.only&&uc.only===true){
                params.only = true;
                console.log("has only");
            }else {
                params.only = false;
            }
            readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "it.tpl.js")));
        }
        var tplStr = readmeTpl(params);
        //console.log(tplStr)
        return preTplStr.concat('\r\n', tplStr);
    },

    writing: function() {
        var self = this;
        //读取所有的uc文件
        fs.readdir(self.ucPath, (err, files) => {
            //缓存uc文件数据
            var ucArray = [];
            var fileNameArray = [];
            files.forEach(file=>{
                var uc = require(path.join(self.ucPath, file));
                ucArray.push(uc);
                fileNameArray.push(file);
            });

            //换成it数据
            var itCache = {};
            ucArray.forEach(function(ucData) {
                if (ucData.children && _.isArray(ucData.children)) {
                    self._iteratorUc(itCache, ucData.children);
                }
            });

            //开始生产文件
            ucArray.forEach(function(uc, index) {

                if (uc.build === undefined || uc.build === true) {
                    var handler = false;
                    var handlerName = "";
                    //判断handler是否开启，如果开启，生成handler文件
                    if (uc.handler && uc.handler === true) {
                        handler = true;
                        handlerName = fileNameArray[index].replace("uc", "handler");
                        var handlerPath = path.join(self.handlerPath, handlerName);
                        fs.exists(handlerPath, function(exists) {
                            if (!exists) {
                              var handlerTpl = _.template(self.fs.read(path.join(self.tplPath, "handler.tpl.js")));
                              self.fs.write(handlerPath, handlerTpl());
                            }
                        });
                    }

                    var fileContent = self._buildUc(itCache, uc);
                    var wrapperTpl = _.template(self.fs.read(path.join(self.tplPath, "wrapper.tpl.js")));
                    self.fs.write(path.join(self.ucDistPath, fileNameArray[index]), wrapperTpl({ "body": fileContent,"handler":handler,"handlerName":handlerName }));
                   
                }
            });

        });

        //this.log(this.destinationPath());
    }

});
