require('should');
let fs = require('fs');
let path = require('path');

<%if (handler) {%>
  var handler = require("<%=relativePath%>handler/<%=handlerName%>")
<%}%>

<%if (vtestConfig.platform == 'electron') {%>
    var wd = require('webdriver-client')({
        platformName: 'desktop',
        browserName: 'electron'
    });

<%} else if (vtestConfig.platform == 'android') {%>
    var wd = require('webdriver-client')({
        platformName: 'Android',
        reuse:3,
        package: '<%= vtestConfig.package%>',
        activity: '<%= vtestConfig.activity%>',
        udid: "<%= vtestConfig.udid%>"
    });
    require("<%=relativePath%>wd.macaca.js")(wd,"<%=vtestConfig.platform%>");
<%}%>

let describeStart = function(ucKey){
    fs.writeFile("data.log",ucKey);
};
let preLastUcKey = null;
if (fs.existsSync("data.log")) {
    preLastUcKey = fs.readFileSync("data.log", 'utf8');
}

describe('自动化测试', function () {
    this.timeout(5 * 60 * 1000);
    const driver = wd.initPromiseChain();

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
