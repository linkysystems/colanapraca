/**
 * We {{share-url-links
 *   url=""
 *
 * }}  helper
 *
 * usage:  {{share-url-links url='' title=''}}
 */

module.exports = function(we) {
  return function helper() {
    const options = arguments[arguments.length-1];

    if (!options.hash.url) return '';

    let url = we.config.hostname+options.hash.url;
    let title = options.hash.title;
    // let teaser = options.hash.teaser;

    const siteName = (we.systemSettings.siteName || we.config.appName);

    let html = `
      <a href="https://twitter.com/intent/tweet?url=${url}&text=${title} no '${siteName}'" class="s-twitter" target="_blank">
          <img src="/public/project/icons/twitter.png" alt="Compartilhar no Twitter" />
      </a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" class="s-facebook" target="_blank">
        <img src="/public/project/icons/facebook.png" alt="Compartilhar no Facebook" />
      </a>
      <a href="https://www.linkedin.com/shareArticle?mini=true&url=${url}&title={${title}}" class="s-linkedin" target="_blank">
        <img src="/public/project/icons/linkedin.png" alt="Compartilhar no Linkedin" />
      </a>
      <a href="whatsapp://send?text=${title}  no '${siteName}': ${url}" data-action="share/whatsapp/share" class="s-whatsapp-mobile"><img src="/public/project/icons/whatsapp.png" alt="Compartilhar no Whatsapp" /></a>
      <a href="https://web.whatsapp.com/send?text=${title} no '${siteName}': ${url}" data-action="share/whatsapp/share" class="s-whatsapp-site" target="_blank"><img src="/public/project/icons/whatsapp.png" alt="Compartilhar no Whatsapp" /></a>
      <a href="mailto:?subject=${title}:&amp;body=${title} - Leia mais no link: ${url}"
         title="Compartilhar por Email">
        <img src="/public/project/icons/email.png" alt="Compartilhar por e-mail">
      </a>`;

    return new we.hbs.SafeString(html);
  }
}