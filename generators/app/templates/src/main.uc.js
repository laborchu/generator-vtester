'use strict';

var wd = require('webdriver-client')({
  platformName: 'desktop',
  browserName: 'electron'
});


const driver = wd.initPromiseChain();

var osCommonUc = require('./os-common-uc')
var osStudentUc = require('./os-student-uc')

var logger = function(msg){
  console.log(msg);
}
var promise = null;
var getCaller = function(){
  if(promise==null){
    return driver;
  }else{
    return promise;
  }
}
var setCaller = function(caller){
  promise = caller;
}
var loadUcPath = function(index,paths){
       
  var step = paths[index];
  if(step.type=="url"){
    setCaller(getCaller().get(step.url));
    logger("go "+step.url);
  }else if(step.type=="click"){
    if(step.selector=="xpath"){
      setCaller(getCaller().elementByXPathOrNull(step.element).click());
      logger("click by xpath "+step.element);
    }
  }else if(step.type=="input"){
    if(step.selector=="name"){
      setCaller(getCaller().elementByName(step.element).sendKeys(step.value));
      logger("input by name "+step.element);
    }
  }

  if(step.sleep&&step.sleep>0){
    logger("sleep "+step.sleep);
    setCaller(getCaller().sleep(step.sleep));
  }

  var goNext = function(){
    if(paths.length>(index+1)){
      promise =loadUcPath(index+1,paths);
    }
  }
  //处理验证
  
  if(step.checking){
    var checkResult = {};//pending 处理中 pass成功  error错误  stop停止path
    Object.keys(step.checking).forEach(function(key) {
      checkResult[key] = "pending";
      var checkData = step.checking[key];
      var checkAfterDo = function(){
        var result = "pass";
        Object.keys(checkResult).forEach(function(checkKey) {
          if(checkResult[checkKey]=="error"){
            result = "error";
          }else if(checkResult[checkKey]=="stop"&&result!="error"){
            result = "stop";
          }
        });
        if(result=="pass"){
          setCaller(null);
          goNext();
        }
      }

      logger("checking "+key);
      if(key=="stop"){
        setCaller(getCaller().elementByXPathOrNull(checkData.element)
          .then(function(element) {
            if(element==checkData.value){
              checkResult[key] = "stop";
            }else{
              checkResult[key] = "pass";
            }
            checkAfterDo();
          }));
      }else if(key=="eq"){
        if(checkData.selector=="xpath"){
          setCaller(getCaller().elementByXPathOrNull(checkData.element)
          .then(function(element) {
            checkData.value.should.equal(element);
          }));
        }
      }
    });
  }else{
    goNext();
  }
  return promise;

}

var loadUc = function(uc){
  //先判断有没有先决条件执行
  if(uc.pre){
    var preUc = osCommonUc.uc[uc.pre];
      if(!preUc){
        throw new Error(uc.pre+' common uc not exsits');
      }
      loadUc(preUc);
  }
  //判断是否有子的用例
  if(uc.subUcs&&uc.subUcs.length>0){
    describe(uc.title, function() {
      uc.subUcs.forEach(function(subUc){
        loadUc(subUc)
      })
    });
  }else{
    it(uc.title, function() {
       if(uc.paths&&uc.paths.length>0){
        promise = null;
        return loadUcPath(0,uc.paths);

      }
    });
  }
}

describe('自动化测试', function() {
  this.timeout(5 * 60 * 1000);
  before(() => {
    return driver
      .initDriver()
      .maximize()
      .setWindowSize(1280, 800);
  });

  osStudentUc.forEach(function(uc){
    loadUc(uc)
  })

  after((done) => {
    return driver
      .quit(done);
  });
});
