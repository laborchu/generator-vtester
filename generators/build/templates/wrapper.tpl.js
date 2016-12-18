require('should');
let fs = require('fs');
let path = require('path');
var should = require('should');

<%if (handler) {%>
  var handler = require("<%=relativePath%>handler/<%=handlerName%>")
<%}%>

<%if (filter) {%>
  var filter = require("<%=relativePath%>filter/<%=filterName%>")
<%}%>

<%if (vtestConfig.platform == 'electron') {%>
    var wd = require('webdriver-client')({
        platformName: 'desktop',
        browserName: 'electron'
    });

    const driver = wd.initPromiseChain();
    driver.cacheElements = [];
<%} else if (vtestConfig.platform == 'android') {%>
    var wd = require('webdriver-client')({
        platformName: 'Android',
        reuse:3,
        package: '<%= vtestConfig.package%>',
        activity: '<%= vtestConfig.activity%>',
        udid: "<%= vtestConfig.udid%>"
    });

    const driver = wd.initPromiseChain();
    driver.cacheElements = [];
    driver.cacheDescs = [];
    var handler = require("<%=relativePath%>handler/handler.js");
    var filter = require("<%=relativePath%>filter/filter.js");
    require("./vtester.driver.js")(wd,driver,"<%=vtestConfig.platform%>");
    var router = require("<%=relativePath%>router.uc.js");
<%}%>

let describeStart = function(ucKey){
    fs.writeFile("data.log",ucKey);
};
let preLastUcKey = null;
if (fs.existsSync("data.log")) {
    preLastUcKey = fs.readFileSync("data.log", 'utf8');
    if(preLastUcKey.length==0){
        preLastUcKey = null;
    }else{
        preLastUcKey = preLastUcKey.replace("\r","").replace("\n","");
    }
}

describe('自动化测试', function () {
    this.timeout(5 * 60 * 1000);
    <%if (vtestConfig.platform == 'electron') {%>
        before(() => {
            return driver
                .initDriver()
                .maximize();
        });
    <%} else if (vtestConfig.platform == 'android') {%>
        driver.configureHttp({
            timeout: 600000
        });

        before(() => {
            return driver.initDriver();
        });
    <%}%>

    <%= body %>
        after((done) => {
            return driver
                .sleep(1000)
                .quit(done);
        });
});
