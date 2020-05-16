const setCanonicalURL = require('./setCanonicalURL.js');
const urlParser = require('js-video-url-parser');


function findOne(req, res, next) {
  if (!res.locals.data) return next();
  const we = req.we;
  const r = res.locals.data;

  const siteName = (we.systemSettings.siteName || we.config.appName);
  const hostname = we.config.hostname;

  res.locals.metatag +=
    '<meta property="og:url" content="'+hostname+req.urlBeforeAlias+'" />'+
    '<meta property="og:title" content="'+res.locals.title+'" />' +
    '<meta property="og:site_name" content="'+siteName+'" />'+
    '<meta property="og:type" content="article" />'+
    '<meta content="'+siteName+'" itemprop="name">';

  setCanonicalURL(req, res);

  let description = '';

  if (r.body) {
    description = we.utils.stripTagsAndTruncate (
      r.body, 200
    );
  } else if (we.systemSettings.siteDescription) {
    description = we.utils.stripTagsAndTruncate (
      we.systemSettings.siteDescription, 200
    );
  }

  if (description) {
    res.locals.metatag += '<meta property="og:description" content="'+
      description+
    '" />';
    res.locals.metatag += '<meta content="'+description+'" name="description">';
    res.locals.metatag += '<meta content="'+description+'" name="twitter:description">';
  }

  let imgURL = '';
  let imgWidth = '1200';
  let imgHeight = '630';

  if (r.featuredImage && r.featuredImage[0]) {
    let img = r.featuredImage[0];

    imgURL = hostname + img.urls.large;

    imgWidth = '640';
    imgHeight = '400';

    res.locals.metatag +=
      '<meta property="og:image" content="'+imgURL+'" />'+
      '<meta property="og:image:type" content="'+img.mime+'" />';
  } else if (r.videoUrls && r.videoUrls.length) {
    let info = urlParser.parse(r.videoUrls[0].url);
    let url;
    if (info && info.provider) {
      url = urlParser.create({
        videoInfo: info,
        format: 'shortImage'
      });

      if (url) {
        imgURL = url;
        res.locals.metatag +=
        '<meta property="og:image" content="'+imgURL+'" />';
      }
    }

  }

  if (!imgURL) {
    if (we.systemSettings.ogImageUrlOriginal) {
      const imageUrl = we.systemSettings.ogImageUrlOriginal;

      imgURL = hostname + imageUrl;

      res.locals.metatag +=
        '<meta property="og:image" content="'+hostname+imageUrl+'" />';
    }
  }

  // add google pagemap
  res.locals.metatag += `<!--
  <PageMap>
     <DataObject type="document">
        <Attribute name="title">${res.locals.title}</Attribute>
        <Attribute name="description">${description}</Attribute>
        <Attribute name="last_update">${r.updatedAt}</Attribute>
     </DataObject>
     <DataObject type="thumbnail">
        <Attribute name="src" value="${imgURL}" />
        <Attribute name="height" value="${imgHeight}" />
        <Attribute name="width" value="${imgWidth}" />
     </DataObject>
  </PageMap>
  -->`;

  if (r.tags && r.tags.length) {
    res.locals.metatag +=
      '<meta name="keywords" content="'+r.tags.join(',')+'" />';
  } else if (we.systemSettings.metatagKeywords) {
    res.locals.metatag +=
      '<meta name="keywords" content="'+we.systemSettings.metatagKeywords+'" />';
  }

  next();
}

module.exports = findOne;