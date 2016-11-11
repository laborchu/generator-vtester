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

ItBuilder.prototype.sleep = function(time) {
    var compiled = _.template(".sleep(<%= time %>)");
    this.itContent = this.itContent.concat(compiled({ 'time': time }));
    return this;
};
ItBuilder.prototype.append = function(content) {
    this.itContent = this.itContent.concat(content);
    return this;
};
ItBuilder.prototype.toString = function() {
    return this.itContent+";";
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
        if(this.options.projectPath){
            this.projectPath = this.options.projectPath;
            this.tplPath = this.projectPath+"/src/tpl/";
        }else{
            this.projectPath = this.destinationPath();
            this.tplPath = this.templatePath;
        }
        this.ucPath = this.projectPath+"/src/uc/";
        this.ucDistPath = this.projectPath+"/src/dist/";
        this.handlerPath = this.projectPath+"/src/handler/";
        this.plugins = {
            path:{},
            checker:{}
        };
    },

    _iteratorUc: function(itCache, children) {
        var self = this;
        children.forEach(child => {
            if (child.ucKey) {
                itCache[child.ucKey] = child;
            }
            if (child.children && _.isArray(child.children)) {
                self._iteratorUc(itCache, child.children);
            }
        }); 
    },

    _buildPath: function(index, paths, builder) {
        var self = this;
        var step = paths[index];

        var pathPlugin = self.plugins.path[step.type];
        if(pathPlugin){
            builder.append(pathPlugin.build(step));
            //console.log(pathPlugin.build(step));
        }

        if (step.sleep && step.sleep > 0) {
            builder.sleep(step.sleep);
        }

        var goNext = function(targetBuilder) {
            if (paths.length > (index + 1)) {
                self._buildPath(index + 1, paths, targetBuilder);
            }
        };

        if (step.checker) {
            var hasStop = false;
            Object.keys(step.checker).forEach(function(key) {
                var checkData = step.checker[key];
                var checkerPlugin = self.plugins.checker[key];
                if(checkerPlugin){
                    if (key == "stop") {
                        hasStop = true;
                        var stopBuilder = new ItBuilder();
                        goNext(stopBuilder);
                        var config = _.extend({body:stopBuilder.toString()},checkData);
                        builder.append(checkerPlugin.build(config));
                    }else{
                        builder.append(checkerPlugin.build(checkData));
                    }
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
        var prePath = "";
        //判断uc是否存在path
        if (uc.paths && _.isArray(uc.paths)) {
            var builder = new ItBuilder();
            self._buildPath(0, uc.paths, builder);
            if (uc.sleep && uc.sleep > 0) {
                builder.sleep(uc.sleep);
            }
            content = builder.toString();
            params.body = content;
            if(uc.only&&uc.only===true){
                params.only = true;
                console.log("has only");
            }else {
                params.only = false;
            }
            readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "it.tpl.js")));
            var itStr = readmeTpl(params);
            if (uc.children && _.isArray(uc.children)) {
                prePath = itStr;
            }else{
                preTplStr = preTplStr.concat(itStr);
            }
        }
        if (uc.children && _.isArray(uc.children)) {
            if(prePath){
                content = prePath;
            }else{
                content = "";
            }
            uc.children.forEach(child => {
                var it = self._buildUc(itCache, child);
                content = content.concat(it);
            });
            params.body = content;
            readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "describe.tpl.js")));
            var describeStr = readmeTpl(params);
            preTplStr = preTplStr.concat(describeStr);
        }
        //console.log(tplStr)
        return preTplStr;
    },

    _loadPlugins:function(rootPath,cat){
        var self = this;
        var pluginFolder = path.join(rootPath,cat);
        var pluginFiles = fs.readdirSync(pluginFolder);
        pluginFiles.forEach(function (filename) {
            var filePath = path.join(pluginFolder, filename);
            if(fs.lstatSync(filePath).isDirectory()){
                var pluginPath = path.join(filePath, "index.js");
                if(fs.existsSync(pluginPath)){
                    var Plugin = require(pluginPath);
                    var plugin = new Plugin();
                    plugin.init(filename);
                    self.plugins[cat][filename]=plugin;
                }
            }
        });
    },

    writing: function() {
        var self = this;

        //读取默认插件
        var defaultPluginPath = this.templatePath("../plugins");
        //读取path plugin
        self._loadPlugins(defaultPluginPath,"path");
        //读取checker plugin
        self._loadPlugins(defaultPluginPath,"checker");

        //读取项目插件

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
