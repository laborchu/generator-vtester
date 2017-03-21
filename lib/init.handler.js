'use strict';
var Handler = require('./handler');
let fs = require('fs');
let path = require('path');
var Logger = require('./logger');

let projectStruct = {
    "src": {
        "handler": true,
        "uc": true
    },
    "plugins": {
        "path": true,
        "checker": true
    },
    "test": true
};

let createFolder = function(parentFolder, folderObject) {
    for (let key of Object.keys(folderObject)) {
        let curPath = path.join(parentFolder, key);
        Logger.info('create folder ' + curPath.replace(process.cwd(), ""));
        fs.mkdirSync(curPath);
        if (typeof folderObject[key] === 'object') {
            createFolder(curPath, folderObject[key]);
        }
    }
};

let copyFile = function(src,dist){
    if (!fs.existsSync(dist)) {
        var sourceFile = path.join(src);
        var readStream = fs.createReadStream(sourceFile);
        var writeStream = fs.createWriteStream(dist,{mode: 0o777});
        readStream.pipe(writeStream);
    }
};

var InitHandler = module.exports = Handler.extend({
	constructor: function (platform) {
		this.platform = platform;
	}
});
InitHandler.prototype.do = function() {
    InitHandler.__super__.do();
    let rootFolder = process.cwd();
    var folderFiles = fs.readdirSync(rootFolder);
    if (folderFiles.length > 0) {
        Logger.error('current folder is not empty');
        return;
    }
    Logger.success(`start init ${this.platform} project`);
    //初始化文件夹
    createFolder(rootFolder, projectStruct);
    //复制模板
    let sourcePkg = path.join(__dirname, "../","tpl","package.tpl.json");
    let targetPkg = path.join(process.cwd(),"package.json");
    copyFile(sourcePkg,targetPkg);

    let sourceVtester = path.join(__dirname, "../","tpl",`vtester.${this.platform}.json`);
    let targetVtester = path.join(process.cwd(),"vtester.json");
    copyFile(sourceVtester,targetVtester);

    let sourcePageMap = path.join(__dirname, "../","tpl",'page.map.js');
    let targetPageMap = path.join(process.cwd(),"src","page.map.js");
    copyFile(sourcePageMap,targetPageMap);

    Logger.success(`success init ${this.platform} project`);

};
