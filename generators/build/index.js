"use strict";
let yeoman = require('yeoman-generator');
let chalk = require('chalk');
let yosay = require('yosay');
let path = require('path');
let _ = require('lodash');
let fs = require('fs');
let helper = require('./helper');

const PLUGIN_PATH = "path";
const PLUGIN_CHECKER = "checker";
const UC_FILE_SUFFIX = '.uc.js';

class UcBuilder {
    constructor(itContent) {
        this.itContent = itContent||"return driver";
    }

    sleep(time) {
        this.itContent = this.itContent.concat(`.sleep(${time})`);
        return this;
    }

    append(content) {
        this.itContent = this.itContent.concat(content);
        return this;
    }

    toString() {
        return this.itContent + ";";
    }
}

let emptyDir = function (fileUrl) {
    let files = fs.readdirSync(fileUrl); //读取该文件夹
    files.forEach(file => {
        let fullPath = path.join(fileUrl, file);
        let stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            emptyDir(fullPath);
            fs.rmdir(fullPath);
        } else {
            fs.unlinkSync(fullPath);
        }
    });
};

let readAllUc = function (dir) {
    var filesArr = [];
    (function readDir(dirpath) {
        var files = fs.readdirSync(dirpath);
        files.forEach(file => {
            let fullPath = path.join(dirpath, file);
            var info = fs.statSync(fullPath);
            if (info.isDirectory()) {
                readDir(fullPath);
            } else {
                if (file.endsWith(UC_FILE_SUFFIX)) {
                    filesArr.push(fullPath);
                }
            }
        });
    })(dir);
    return filesArr;
};

module.exports = yeoman.Base.extend({

    prompting: function () {
        // Have Yeoman greet the user.
        this.log(yosay(
            'Welcome to the praiseworthy ' + chalk.red('generator-vtester') + ' generator!'
        ));
        //设置交互信息
        var prompts = [];
        return this.prompt(prompts).then(function (props) {
            this.props = props;
        }.bind(this));
    },

    defaults: function () {
        if (this.options.projectPath) {
            this.projectPath = path.join(this.options.projectPath);
            this.tplPath = path.join(this.projectPath, "/src/tpl/");
        } else {
            this.projectPath = this.destinationPath();
            this.tplPath = this.templatePath;
        }
        this.vtestConfig = require(path.join(this.projectPath, "vtester.json"));
        this.srcPath = path.join(this.projectPath, "/src/");
        this.ucPath = path.join(this.projectPath, "/src/uc/");
        this.ucDistPath = path.join(this.projectPath, "/src/dist/");
        this.handlerPath = path.join(this.projectPath, "/src/handler/");
        this.filterPath = path.join(this.projectPath, "/src/filter/");
        this.plugins = {
            path: {},
            checker: {}
        };
        var pageMapPath = path.join(this.projectPath, "/src/page.map.js");
        if (fs.existsSync(pageMapPath)) {
            let pageConfig = require(pageMapPath);
            this.pageArray = pageConfig.pageTree;
            this.pageLink = pageConfig.pageLink;
            this.pageMap = new Map();
            var self = this;
            let itePageMap = function(pageArray){
                pageArray.forEach(function(page){
                    self.pageMap[page.ucKey] = page;
                    if(page.children){
                        itePageMap(page.children);
                    }
                });
            };
            itePageMap(self.pageArray);

        }
    },

    _iteratorUc: function (itCache, children) {
        children.forEach(child => {
            if (child.ucKey) {
                itCache[child.ucKey] = child;
            }
            if (child.children && _.isArray(child.children)) {
                this._iteratorUc(itCache, child.children);
            }
        });
    },

    _buildPath: function (index, paths, builder) {
        var self = this;
        var step = paths[index];
        if (step.type) {
            var pathPlugin = self.plugins.path[step.type];
            if (pathPlugin) {
                helper.checkPathConfig(pathPlugin, step); //检查配置
                let config = _.extend(step, {vtestConfig:self.vtestConfig});
                builder.append(pathPlugin.build(config));
            }
        }

        if (step.sleep && step.sleep > 0) {
            builder.sleep(step.sleep);
        }

        var goNext = function (targetBuilder) {
            if (paths.length > (index + 1)) {
                self._buildPath(index + 1, paths, targetBuilder);
            }
        };

        if (step.checker) {
            var hasStop = false;
            Object.keys(step.checker).forEach(function (key) {
                var checkData = step.checker[key];
                var checkerPlugin = self.plugins.checker[key];
                if (checkerPlugin) {
                    helper.checkCheckerConfig(checkerPlugin, checkData); //检查配置
                    if (key == "stop") {
                        hasStop = true;
                        let stopBuilder = new UcBuilder();
                        goNext(stopBuilder);
                        let config = _.extend({body: stopBuilder.toString()}, checkData,{vtestConfig:self.vtestConfig});
                        builder.append(checkerPlugin.build(config));
                    } else if (key == "iftrue") {
                        let iftrueBuilder = new UcBuilder();
                        self._buildPath(0, checkData.paths, iftrueBuilder);
                        let config = _.extend({body: iftrueBuilder.toString()}, checkData,{vtestConfig:self.vtestConfig});
                        builder.append(checkerPlugin.build(config));
                    } else {
                        let config = _.extend(checkData,{vtestConfig:self.vtestConfig});
                        builder.append(checkerPlugin.build(config));
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

    _buildUc: function (itCache, uc, index) {
        index = index || 0;
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
        helper.checkUcConfig(uc, index);
        //处理uc
        var params = {"title": uc.title,"ucKey":uc.ucKey};
        var readmeTpl;
        var prePath = "";
        //判断uc是否存在path
        if (uc.paths && _.isArray(uc.paths)&&uc.paths.length>0) {
            var builder = new UcBuilder();
            self._buildPath(0, uc.paths, builder);
            if (uc.sleep && uc.sleep > 0) {
                builder.sleep(uc.sleep);
            }
            params.body = builder.toString();
            if (uc.only && uc.only === true) {
                params.only = true;
            } else {
                params.only = false;
            }
            readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "it.tpl.js")));
            var itStr = readmeTpl(params);
            if (uc.children && _.isArray(uc.children)) {
                prePath = itStr;
            } else {
                preTplStr = preTplStr.concat(itStr);
            }
        }
        if (uc.children && _.isArray(uc.children)) {
            let content = "";
            if (prePath) {
                content = prePath;
            }
            uc.children.forEach((child) => {
                var it = self._buildUc(itCache, child, index + 1);
                content = content.concat(it);
            });
            params.body = content;
            if(self.pageMap&&self.pageMap[uc.ucKey]){
                params.isTopUc = true;
                params.winName = self.pageMap[uc.ucKey].ucKey;
            }else{
                params.isTopUc = false;
            }
            if (uc.only && uc.only === true) {
                params.only = true;
            } else {
                params.only = false;
            }
            readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "describe.tpl.js")));
            var describeStr = readmeTpl(params);
            preTplStr = preTplStr.concat(describeStr);
        }
        //console.log(tplStr)
        return preTplStr;
    },

    _buildDriver: function () {
        var self = this;
        var driverStr = "";
        if(this.pageLink){
            for (var key in this.pageLink) {
                var link = this.pageLink[key];
                if (link.paths && _.isArray(link.paths)) {
                    var builder = new UcBuilder("return this");
                    self._buildPath(0, link.paths, builder);
                    if (link.sleep && link.sleep > 0) {
                        builder.sleep(link.sleep);
                    }
                    let readmeTpl = _.template(this.fs.read(path.join(self.tplPath, "promise-chain-method.tpl.js")));
                    driverStr += readmeTpl({
                        name:key,
                        body:builder.toString()
                    });
                }
            }
        }
        return driverStr;
    },

    _loadPlugins: function (rootPath, cat) {
        var self = this;
        var pluginFolder = path.join(rootPath, cat);
        var pluginFiles = fs.readdirSync(pluginFolder);
        pluginFiles.forEach(function (filename) {
            var filePath = path.join(pluginFolder, filename);
            if (fs.lstatSync(filePath).isDirectory()) {
                var pluginPath = path.join(filePath, "index.js");
                if (fs.existsSync(pluginPath)) {
                    var Plugin = require(pluginPath);
                    var plugin = new Plugin();
                    plugin.init(filename);
                    self.plugins[cat][filename] = plugin;
                }
            }
        });
    },

    writing: function () {
        var self = this;

        //读取默认插件
        var defaultPluginPath = this.templatePath("../plugins");
        //读取path plugin
        self._loadPlugins(defaultPluginPath, PLUGIN_PATH);
        //读取checker plugin
        self._loadPlugins(defaultPluginPath, PLUGIN_CHECKER);

        emptyDir(self.ucDistPath);
        var files = readAllUc(self.ucPath);
        //读取所有的uc文件
        //缓存uc文件数据
        var ucArray = [];
        var fileNameArray = [];
        files.forEach(file => {
            var uc = require(file);
            ucArray.push(uc);
            var fileName = file.replace(self.ucPath, "");
            fileNameArray.push(fileName);
        });

        //换成it数据
        var itCache = new Map();
        ucArray.forEach(function (ucData) {
            if (ucData.children && _.isArray(ucData.children)) {
                self._iteratorUc(itCache, ucData.children);
            }
        });
        let ucFileNameMap = new Map();
        //开始生产文件
        ucArray.forEach(function(uc, index) {
            var relativePath="../";
            var arr =fileNameArray[index].match(new RegExp('\\\\',"g"));
            if(arr&&arr.length>0){
              for(var i=0;i<arr.length;i++){
                relativePath='../'+relativePath;
              }
            }

            if (uc.build === undefined || uc.build === true) {
                //处理handler
                let handler = false;
                let handlerName = "";
                //判断handler是否开启，如果开启，生成handler文件
                if (uc.handler && uc.handler === true) {
                    handler = true;
                    handlerName = fileNameArray[index].replace("uc", "handler");
                    handlerName = handlerName.replace( /\\/g,"/");
                    let handlerPath = path.join(self.handlerPath, handlerName);
                    if(!fs.existsSync(handlerPath)){
                        let handlerTpl = _.template(self.fs.read(path.join(self.tplPath, "handler.tpl.js")));
                        self.fs.write(handlerPath, handlerTpl());
                    }
                }
                //处理filter
                let filter = false;
                let filterName = "";
                //判断handler是否开启，如果开启，生成handler文件
                if (uc.filter && uc.filter === true) {
                    filter = true;
                    filterName = fileNameArray[index].replace("uc", "filter");
                    //多层次文件夹 会出现反斜杠
                    filterName = filterName.replace( /\\/g,"/");
                    let filterPath = path.join(self.filterPath, filterName);
                    if(!fs.existsSync(filterPath)){
                        let handlerTpl = _.template(self.fs.read(path.join(self.tplPath, "filter.tpl.js")));
                        self.fs.write(filterPath, handlerTpl());
                    }
                }
                helper.checkUcFile(fileNameArray[index]);
                let fileContent = self._buildUc(itCache, uc);
                if(self.vtestConfig.platform=='android'){
                    var fileName = fileNameArray[index];
                    ucFileNameMap[uc.ucKey] = `require('./${fileName}')(driver,router);`;
                    let wrapperTpl = _.template(self.fs.read(path.join(self.tplPath, "android-wrapper.tpl.js")));
                    self.fs.write(path.join(self.ucDistPath, fileNameArray[index]), wrapperTpl({
                        "body": fileContent,
                        "handler": handler,
                        "handlerName": handlerName,
                        "filter": filter,
                        "filterName": filterName,
                        "relativePath":relativePath
                    }));

                }else if(self.vtestConfig.platform=='electron'){
                    let wrapperTpl = _.template(self.fs.read(path.join(self.tplPath, "wrapper.tpl.js")));
                    self.fs.write(path.join(self.ucDistPath, fileNameArray[index]), wrapperTpl({
                        "body": fileContent,
                        "vtestConfig": self.vtestConfig,
                        "handler": handler,
                        "handlerName": handlerName,
                        "filter": filter,
                        "filterName": filterName,
                        "relativePath":relativePath
                    }));
                }
            }
        });

        if(self.vtestConfig.platform=='android'){
            var fileContent = "";
            let itePageMap = function(pageArray){
                pageArray.forEach(function(page){
                    if(!page.last){
                        if(ucFileNameMap[page.ucKey]){
                            fileContent+=ucFileNameMap[page.ucKey];
                        }
                    }
                    if(page.children){
                        itePageMap(page.children);
                    }
                    if(page.last){
                        if(ucFileNameMap[page.ucKey]){
                            fileContent+=ucFileNameMap[page.ucKey];
                        }
                    }
                });
            };
            itePageMap(self.pageArray);
            let wrapperTpl = _.template(self.fs.read(path.join(self.tplPath, "wrapper.tpl.js")));
            self.fs.write(path.join(self.ucDistPath, "all.uc.js"), wrapperTpl({
                "body": fileContent,
                "handler":null,
                "filter":null,
                "relativePath":"../",
                "vtestConfig": self.vtestConfig
            }));
        }
        //处理driver扩展
        let driverStr = self._buildDriver();
        if(driverStr&&driverStr.length>0){
            let driverTpl = _.template(self.fs.read(path.join(self.srcPath, "vtester.driver.js")));
            self.fs.write(path.join(self.ucDistPath, "vtester.driver.js"), driverTpl({
                "body": driverStr
            }));
        }
    }

});
