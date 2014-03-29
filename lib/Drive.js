/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var GlobalConfig = require('./GlobalConfig');
var cluster = require('cluster');
var fs = require('fs-extra');
var _ = require('underscore');
var hooks = require('hooks');
var driver = new Driver();
var connect = require('connect');

function Driver() {}

for (var k in hooks) {
  Driver.prototype[k] = Driver[k] = hooks[k];
}

Driver.hook('loadConfig', function(cb) {
  GlobalConfig.initialize();
  process.nextTick(function(){
    cb();
  });
});

Driver.hook('buildRouter', function(cb) {
  var routes     = fs.readJSONSync('./routes.json');
  require('./Router').routes(routes);
  process.nextTick(function() {
    cb();
  });
});

Driver.hook('startAutoloader', function(cb) {
 var path       = require('path');
 var libdir     = path.dirname(module.filename);
 var cwd        = process.cwd();
 var AutoLoader = require ('./AutoLoader');

  AutoLoader.scandir(libdir);
  AutoLoader.scandir(cwd);
  process.nextTick(function() {
    cb();
  });
});

Driver.hook('startServer', function(app, cb) {
  var domain = require('domain');
  var Router = require('./Router');
  var url = require('url');
  var http = require('http');
  var Connection = require('./Connection');
  var AutoLoader = require("./AutoLoader"), controller;
  var turnpike_server = require('./turnpike_server');

  app.use(turnpike_server());

  this.server = http.createServer(app);
  this.server.listen(GlobalConfig.port);

  if (typeof(cb) === 'function') {
    cb();
  }
});

Driver.hook('fork', function(cb) {
  var workers = Math.max(require('os').cpus().length + 1, 3)
    , active = 0
    , initialForks = true;
  console.log('Setting up workers.');
  cluster.on('fork', function(worker) {
    console.log('Created worker: ' + worker.id);
    if (++active == workers && initialForks) {
      initialForks = false;
      cb(workers);
    }
  });
  cluster.on('disconnect', function(worker) {
    active--;
    console.error('Worker ' + worker.id + ' crashed!');
    console.log('Replacing crashed worker ' + worker.id + ' in 3 seconds.\n' + active +
      ' functioning workers until replacement spawns.');
    setTimeout(function(){ cluster.fork(); }, 3000);
  });
  for (var i = 0; i < workers; i++) {
    cluster.fork();
  }
});

var drive = function() {
  require(process.cwd() + '/api/init.js');

  if (cluster.isMaster && !GlobalConfig.testing) {
    driver.fork(function(workers) {
      console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
      console.log('The turnpike is now open on port ' + GlobalConfig.port);
    });
  }
  else {
    process.nextTick(function() {
      driver.loadConfig(function() {
        driver.buildRouter(function() {
          driver.startAutoloader(function() {
            driver.startServer(
              connect().use(connect.logger({'buffer': false, 'immediate': true}))
                       .use(connect.favicon())
                       .use(connect.static('public'))
                       .use(connect.cookieParser())
                       .use(connect.urlencoded())
                       .use(connect.json()),
              function(){}
            );
          });
        });
      });
    });
  }
};

module.exports.drive = drive;
module.exports.Driver = driver;
