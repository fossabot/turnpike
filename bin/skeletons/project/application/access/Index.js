/**
 * Access control rules for the Index controller.
 * These rules will control access to your home page. Typically you want to
 * keep this permissive.
 */

function Index(route, callback) {
  callback(undefined, true);
}

module.exports = Index;
