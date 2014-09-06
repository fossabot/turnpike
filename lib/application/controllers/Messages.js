/**
 * Autogenerated Messages controller.
 */
var EndpointController = require('../../classes/base/controller/EndpointController');
var util     = require('util');

function Messages(connection) {
  EndpointController.call(this, connection);
}
util.inherits(Messages, EndpointController);

Messages.prototype.getMessages = function(readyCallback) {
  this.connection.session.getMessages(function(err, messages) {
    this.data = { 'messages': messages };
    if (!this.data.messages) {
      this.data.messages = [];
    }
    process.nextTick(readyCallback);
  }.bind(this));
};

Messages.prototype.killMessages = function(readyCallback) {
  this.connection.session.getMessages(function(err, messages) {
    this.data = {'status': 'OK'};
    process.nextTick(readyCallback);
  }.bind(this));
};

module.exports = Messages;