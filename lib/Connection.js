/**
 * Turnpike plumbing.
 *
 * Connection objects are created by the Turnpike listener, and are passed to EndpointControllers during the routing
 * process.
 */

var _ = require('underscore');
var hooks = require('hooks');
var Negotiator = require('negotiator').Negotiator;

function Connection(req, res) {
  this.body = '';
  this.method = req.method;

  var response = ''
    , headers  = {}
    , status   = 200;

  req.on('data', function(chunk) {
    this.body += chunk;
    if (this.body.length > 1e4) {

    }
  });

  /**
   * Makes this connection die immediately.
   *
   * @param status number HTTP Status code to return.
   */
  this.die = function(status, message) {
    message = message || "No reason given by caller";
    res.writeHead(status, message, {'Content-Type': 'text/plain'});
    res.end("Connection died in an error state.");

    return this;
  };

  /**
   * Register a handler for the "end" event. I.e. when the full request body
   * is received.
   *
   * @param callback Function to call when connection body is fully received
   */
  this.end = function(callback) {
    if (callback) {
      req.on('end', callback);
    }
    return this;
  };

  this.send = function() {
    res.writeHead(status, "OK", headers);
    res.end(response);
  };

  this.header = function(append) {
    if (append) {
      headers = _(headers).extend(append);
      return this;
    }
    else {
      return headers;
    }
  };

  this.status = function(newStatus) {
    if (newStatus) {
      status = newStatus;
      return this;
    }
    else {
      return status;
    }
  };

  this.response = function(string) {
    //Allow passing in a function for the response. Execute it to get the actual response.
    if (typeof(string) == 'function') {
      string = string();
    }

    if (string) {
      response = string.toString();
      return this;
    }
    else {
      //With no response string given, return the current one;
      return response;
    }
  };

  this.AcceptableMimeTypes = function(types) {
    var negotiator = Negotiator(req);
    return negotiator.preferredMediaTypes(types);
  };

  this.bestMimeType = function(types) {
    var negotiator = Negotiator(req);
    return negotiator.preferredMediaType(types);
  }
}

module.exports = Connection;
