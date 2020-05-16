/**
 * Widget iframe main file
 *
 * See https://github.com/wejs/we-core/blob/master/lib/class/Widget.js for all Widget prototype functions
 */

module.exports = function (projectPath, Widget) {
  const widget = new Widget('iframe', __dirname);

  widget.beforeSave = function iframeWidgetBeforeSave(req, res, next) {
    req.body.configuration = {
      html: req.body.html,
      align: req.body.align
    };

    return next();
  };

  return widget;
};