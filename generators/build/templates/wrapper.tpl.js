require('should');
<%if(handler){%>
  var handler = require("<%=relativePath%>handler/<%=handlerName%>")
<%}%>
var wd = require('webdriver-client')({
  platformName: 'desktop',
  browserName: 'electron'
});


describe('自动化测试', function() {
  this.timeout(5 * 60 * 1000);
  const driver = wd.initPromiseChain();
  before(() => {
    return driver
      .initDriver()
      .maximize()
      .setWindowSize(1280, 800);
  });

  <%= body%>

  after((done) => {
    return driver
      .quit(done);
  });
});
