const urlM = require('url');

module.exports = function(we) {
  return function helper() {
    const options = arguments[arguments.length-1];

    if (!options.hash.steps) {
      return '';
    }

    let url = (options.hash.urlBeforeAlias || options.hash.url);

    if (!options.hash.currenStep) {
      options.hash.currenStep = 1;
    }

    url = urlM.parse(url).pathname;

    let html = '<ul class="nav nav-wizard">';

    for(let id in options.hash.steps) {
      let step = options.hash.steps[id];

      if (step.id == options.hash.currentStep) {
        html += '<li class="active">';
      } else {
        html += '<li>';
      }

      if (options.hash.disableStepLink) {
        html += '<a href="#">'+step.label+'</a>';
      } else {
        html += '<a href="'+url+'?step='+id+'">'+step.label+'</a>';
      }

      html += '</li>';
    }

    html +='</ul>';

    return  new we.hbs.SafeString(html);
  };
}