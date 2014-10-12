var config = require('./../config');
var UploadHandler = require('./middleware/UploadHandler');
var cluster = require('cluster');
var fs = require('fs-extra');
var _ = require('underscore');
var hooks = require('hooks');
var async = require('async');

var Driver = function() {
  for (var k in hooks) {
    //noinspection JSUnfilteredForInLoop
    this[k] = hooks[k];
  }
};

Driver.prototype._pres = {};

Driver.prototype.loadConfig = function(cb) {
  config.initialize();
  process.nextTick(function(){
    cb(false);
  });
};

Driver.prototype.buildRouter = function(cb) {
  var routes     = fs.readJSONSync('./routes.json');
  require('./Router').routes(routes);
  process.nextTick(function() {
    cb(false);
  });
};

Driver.prototype.startAutoloader = function(cb) {
  var cwd        = process.cwd();
  var autoLoader = require ('./../internal/autoLoader');

  autoLoader.scandir(cwd);
  process.nextTick(function() {
    cb(false);
  });
};

Driver.prototype.startServer = function(app, cb) {
  var turnpike_server = require('./turnpike_server');
  var Session = require('./middleware/SessionWrapper');

  app.use(UploadHandler()).
    use(Session.turnpikeSession()).
    use(Session.csrf()).
    use(turnpike_server());


  this.server.listen(config.port);

  if (typeof(cb) === 'function') {
    cb(false);
  }
};

Driver.prototype.fork = function(cb) {
  var workers = require('os').cpus().length
    , active = 0
    , initialForks = true
    , maxProcs = workers + config.max_spare_procs; //Not used yet.

  console.log('Setting up workers.');
  cluster.on('fork', function(worker) {
    console.log('Created worker: ' + worker.id);
    if (++active == workers && initialForks) {
      initialForks = false;
      cb(false, workers);
    }
  });
  cluster.on('disconnect', function(worker) {
    active--;
    console.error('Worker ' + worker.id + ' crashed!');
    console.log('Replacing crashed worker ' + worker.id + ' in 1 second.\n' + active +
      ' functioning workers until replacement spawns.');
    setTimeout(function(){ cluster.fork(); }, 1000);
  });
  for (var i = 0; i < workers; i++) {
    cluster.fork();
  }
};

for (var k in hooks) {
  //noinspection JSUnfilteredForInLoop
  Driver[k] = hooks[k];
}

module.exports = Driver;