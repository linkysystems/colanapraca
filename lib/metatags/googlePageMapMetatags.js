function googlePageMapMetatags(req, res, title, description, updatedAt, imgURL, imgHeight, imgWidth) {

  // add google pagemap
  res.locals.metatag += `
<!--
  <PageMap>
     <DataObject type="document">
        <Attribute name="title">${title}</Attribute>
`

  if (description) {
    res.locals.metatag += `        <Attribute name="description">${description}</Attribute>
`;
  }

  if (updatedAt) {
    res.locals.metatag += `        <Attribute name="last_update">${res.locals.data.updatedAt}</Attribute>
`;
  }

  res.locals.metatag += `     </DataObject>`;

  if (imgURL && imgHeight && imgWidth) {
    // google PageMap tags thumbnail:
    res.locals.metatag += `<DataObject type="thumbnail">
          <Attribute name="src" value="${imgURL}" />
          <Attribute name="height" value="${imgHeight}" />
          <Attribute name="width" value="${imgWidth}" />
       </DataObject>`;
  }

  res.locals.metatag += `
  </PageMap>
-->
`;
}

module.exports = googlePageMapMetatags;