/**
 * Structured metadata form Hotelinky systems
 *
 * @param {Object} req Express.js request
 * @param {Object} res Express.js respose
 */
function setHomePageStructuredData(req, res) {
  const we = req.we;

  if (
    we.systemSettings.siteName &&
    we.systemSettings.sitePhone1
  ) {
      // homepage:
      res.locals.metatag += `<script type="application/ld+json">
  {
    "@context": "http://schema.org",
    "@type": "Organization",
    "url": "${we.config.hostname}",
    "name": "${we.systemSettings.siteName}",
`;

if (we.systemSettings.siteEmail1) {
  res.locals.metatag += `      "email" : "${we.systemSettings.siteEmail1}",
`;
}

if (we.systemSettings.siteAddress) {
  res.locals.metatag += `      "address" : "${we.systemSettings.siteAddress}",
`;
}

if (we.systemSettings.logoUrlOriginal) {
  res.locals.metatag += `      "logo": "${we.config.hostname}${we.systemSettings.logoUrlOriginal}",
`;
}

if (we.systemSettings.sitePhone1) {
  res.locals.metatag += `    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "${we.systemSettings.sitePhone1}",
`;
}

res.locals.metatag += `      "contactType": "Customer service"
    }
  }
</script>
`;

  }
}

module.exports = setHomePageStructuredData;