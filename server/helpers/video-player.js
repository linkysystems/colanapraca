const embed = require('embed-video');

module.exports = function(we) {
  return function helper(url) {
    const options = arguments[arguments.length-1];

    let html = embed(url, {
      attr: options.hash
    });

    return (html || url);
  }
}