/**
 * Turnpike.JS
 *
 * A lightweight and politely opinionated HMVC framework for Node.js. Turnpike can be used as a traditional
 * framework, with code generation and rapid deployment, or invoked as a library for more obscure use cases.
 *
 * Within the framework, some elements will be documented as "plumbing". If you are using Turnpike as a rapid
 * deployment framework, then these should be treated as the internal workings of the Turnpike "black box".
 * You shouldn't need or want to use or call any of the plumbing yourself.
 * If you are using Turnpike as a library, you will probably need use use a good deal of the plumbing directly.
 * If you do this, that's fine, but be aware that continuing development of the Turnpike framework may radically
 * alter the plumbing interfaces at any time, even between minor versions and revisions.
 *
 * Other elements of the framework are documented as "porcelain". These are the entry points to the framework we
 * expect any app relying on Turnpike to use. In general, after the 1.0.0 release, we will aim to maintain the
 * existing plumbing interfaces with few to no changes without a bump in the major version number.
 */

// The big redo:
var turnpike = require('./lib');

module.exports = turnpike;
