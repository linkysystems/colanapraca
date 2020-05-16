/**
 * We {{render-url-video-thumbnail
 *   url=""
 *   width="100%"
 * }}  helper
 *
 * usage:  {{render-url-video-thumbnail record=record req=req}}
 */

const urlParser = require('js-video-url-parser');

module.exports = function(we) {
  return function helper() {
    const options = arguments[arguments.length-1];

    if (!options.hash.url) return '';

    let info = urlParser.parse(options.hash.url);

    if (!info || !info.provider || !info.id) return '';

    let format = options.hash.format || 'shortImage';

    let url = urlParser.create({
      videoInfo: info,
      format: format
    });

    if (!url) return '';

    let tag = '<img src="'+url+'" '

    if (options.hash.alt) tag += ' alt="'+options.hash.alt+'" ';
    if (options.hash.width) tag += ' width="'+options.hash.width+'" ';
    if (options.hash.class) tag += ' class="'+options.hash.class+'" ';

    return new we.hbs.SafeString(tag + ' >');
  }
}