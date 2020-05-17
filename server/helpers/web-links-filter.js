const categories = require('../../lib/categories');

module.exports = function(we) {
  return function helper() {
    const options = arguments[arguments.length-1];

    if (!options.hash.req) return '';

    const currentCat = options.hash.req.query.category;

    let html = '<div class="list-group">';
    let clearActive = '';

    if (!currentCat) {
      clearActive = 'active';
    }

    html +=  `<a href="/web-link" class="list-group-item list-group-item-action ${clearActive}">Ver todos links</a>
        `;

    for (let name in categories) {
      const cat = categories[name];
      let active = '';

      if (name == currentCat) {
        active = 'active';
      }

      const p = `/web-link?category=${name}`;

      html +=  `<a href="${p}" class="list-group-item list-group-item-action ${active}">${cat}</a>
        `;
    }

    html += '</div>';
    return  new we.hbs.SafeString(html);
  };
}