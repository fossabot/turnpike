'use strict';

var hooks = require('hooks');
var async = require('async');

class Renderable {
  constructor (View) {
    this.data = {};
    this.mode = 'main';
    this.view = {};

    if (typeof View === 'function') {
      this.view = new View();
    }
  }

  render(cb) {
    this.view.data(this.data).mode(this.mode).render(cb);
  }
}
for (var k in hooks) {
  // Per hooks module documentation
  // noinspection JSUnfilteredForInLoop
  Renderable[k] = Renderable.prototype[k] = hooks[k];
}


Renderable.pre('render', function(next) {
  var renders = [];
  var item;

  for (item in this.data) {
    // Intent of hasOwnProperty check is handled by constructor test.
    // noinspection JSUnfilteredForInLoop
    if (this.data[item] && typeof this.data[item].render === 'function') {
      //noinspection JSUnfilteredForInLoop
      renders.unshift(function(item, next) {
        // noinspection JSUnfilteredForInLoop
        this.data[item].render.call(this.data[item], function(rendered) {
          console.log(rendered);
          // noinspection JSUnfilteredForInLoop
          this.data[item] = rendered;
          next(false);
        }.bind(this));
      }.bind(this, item));
    }
  }

  async.series(
    renders,
    function() {
        next()
    }
  );
});

module.exports = Renderable;
