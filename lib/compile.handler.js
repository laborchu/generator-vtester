'use strict';
var Handler = require('./handler');
let Vtester = require('vtester-core');

var CompileHandler = module.exports = Handler.extend({
	 constructor: function () {
	 }
});
CompileHandler.prototype.do = function(){
	CompileHandler.__super__.do();
	let vtester = new Vtester(process.cwd());
    vtester.build();
};