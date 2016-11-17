'use strict';
var should = require('should');
module.exports = {
    checkUcConfig: function(uc) {
        should(uc).ok();
        should(uc).instanceOf(Object);
        uc.should.have.property('title').instanceOf(String).ok();
        if (uc.hasOwnProperty('build')) {
            should(uc.build).instanceOf(Boolean);
        }
        if (uc.hasOwnProperty('handler')) {
            should(uc.handler).instanceOf(Boolean);
        }
        if (uc.hasOwnProperty('sleep')) {
            should(uc.sleep).instanceOf(Number);
        }
        if (uc.hasOwnProperty('children')) {
            should(uc.children).instanceOf(Array);
        }
        if (uc.hasOwnProperty('ucKey')) {
            should(uc.ucKey).instanceOf(String);
        }
        if (uc.hasOwnProperty('preUc')) {
            should(uc.preUc).instanceOf(String);
        }
        if (uc.hasOwnProperty('paths')) {
            should(uc.paths).instanceOf(Array);
        }
    },
    checkPathConfig: function(path) {
        should(path).ok();
        should(path).instanceOf(Object);
        path.should.have.property('title').instanceOf(String).ok();

        if (path.hasOwnProperty('type')) {
            should(path.type).instanceOf(String).ok();
            if (path.type !== 'url' && path.type !== 'click' && path.type !== 'input' && path.type !== 'ueditor') {
                throw new Error('path.type should in (url|click|input|ueditor)');
            }
            if (path.type === 'url') {
                path.should.have.property('url').instanceOf(String).ok();
            }
            if (path.type === 'click' || path.type === 'input') {
                path.should.have.property('selector').instanceOf(String).ok();
                path.should.have.property('element').instanceOf(String).ok();
                if (path.selector !== 'xpath' && path.selector !== 'name' && path.selector !== 'className') {
                    throw new Error('path.selector should in (xpath|name|className)');
                }
            }
            if (path.type === 'input') {
                path.should.have.property('value').instanceOf(String);
            }
        }
        if (path.hasOwnProperty('sleep')) {
            should(path.sleep).instanceOf(Number);
        }
        if (path.hasOwnProperty('checker')) {
            should(path.checker).ok();
            should(path.checker).instanceOf(Object);
        }
    },
    checkCheckerConfig: function(key, checker) {
        should(key).instanceOf(String).ok();
        should(checker).instanceOf(Object).ok();
        if (key !== 'stop' && key !== 'eq' && key !== 'eqs' && key !== 'ajax') {
            throw new Error('path.type should in (stop|eq|eqs)');
        } else {
            if (key === 'stop' || key === 'eq' || key === 'eqs') {
                checker.should.have.property('selector').instanceOf(String).ok();
                checker.should.have.property('element').instanceOf(String).ok();
                checker.should.have.property('value');
            }
        }
        if (checker.hasOwnProperty('sleep')) {
            should(checker.sleep).instanceOf(Number);
        }
    }
};
