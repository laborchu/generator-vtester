require('should');
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
        package: '<%= vtestConfig.package%>',
        activity: '<%= vtestConfig.activity%>',
        udid: "<%= vtestConfig.udid%>"
    });
    wd.addPromiseChainMethod('customback', function () {
        if (platform === 'ios') {
            return this;
        }
        return this.back();
    });
<%}%>


describe('自动化测试', function () {
    this.timeout(5 * 60 * 1000);
    const driver = wd.initPromiseChain();

    <%if (vtestConfig.platform == 'electron') {%>
        before(() => {
            return driver
                .initDriver()
                .maximize()
                .setWindowSize(1280, 800);
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
