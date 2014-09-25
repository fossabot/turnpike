/**
 * @constructor
 */

var AutoLoader = require('./../../../internal/autoLoader');
var hooks = require('hooks');
var Session = require('./../../../server/middleware/SessionWrapper');
var async = require('async');

function EndpointController(connection) {
  var $this = this;

  this.connection = connection;
  this.view = this.name = this.constructor.name;
  this.data = {};
  this.title = '';
  this.mode = 'main';

  this.prepare = function(readyCallback) {
    switch (connection.method) {
      case "GET":
        this._GET(readyCallback);
        break;
      case "HEAD":
        this._HEAD(readyCallback);
        break;
      case "PUT":
        this._PUT(readyCallback);
        break;
      case "POST":
        this._POST(readyCallback);
        break;
      case "DELETE":
        this._DELETE(readyCallback);
        break;
    }
  }.bind(this);

  this.deliver = function() {
    var type;
    var types = [];

    for (type in $this.deliver){
      types.push(type);
    }
    console.log($this.name + ' can send types:\n' + types);

    type = connection.bestMimeType(types);

    if (type !== undefined) {
      this.deliver[type]();
    }
    else {
      $this.connection.die(406, "No acceptable return format available.");
    }
  }.bind(this);

  this.deliver['text/html'] = function() {
    var Page = autoLoader.invoke('Page');
    var View = autoLoader.invokeView(this.view);

    View = new View();
    View.mode(this.mode).data(this.data).render(function(html){
        this.connection.header({'content-type' : 'text/html'}).
          response(html);
        Page = new Page(connection);
        Page.prepare(Page.deliver);
      }.bind(this));
  }.bind(this);

  this.deliver['application/json'] = function() {
    var View = autoLoader.invokeView('JSONout');
    View = new View();
    View.mode('main').data(this.data).render(function(output){
      this.connection.header({'content-type' : 'application/json'}).
        response(output).send();
    }.bind(this));
  }.bind(this);

  for (var k in hooks) {
    this[k] = hooks[k];
  }
}

for (var k in hooks) {
  EndpointController.prototype[k] = hooks[k];
}

//Default field mapper. It does nothing.
EndpointController.prototype.fieldMapper = function(field) {
  return field;
};

EndpointController.prototype._GET    = function(readyCallback){
  this.connection.die(405, "Method GET not available for this endpoint")
};

EndpointController.prototype._HEAD   = function(readyCallback){
  this.connection.die(405, "Method HEAD not available for this endpoint")
};

EndpointController.prototype._PUT    = function(readyCallback){
  this.connection.die(405, "Method PUT not available for this endpoint")
};

EndpointController.prototype._POST   = function(readyCallback){
  this.connection.die(405, "Method POST not available for this endpoint")
};

EndpointController.prototype._DELETE = function(readyCallback){
  this.connection.die(405, "Method DELETE not available for this endpoint")
};

module.exports = EndpointController;
