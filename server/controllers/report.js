module.exports = {
  exportHistory(req, res) {
    const we = req.we;
    const conn = we.db.defaultConnection;

    const opts = {};

    if (req.query.q) {
      opts.q = req.query.q;
    }

    if (req.query.title_contains) {
      opts.title_contains = req.query.title_contains;
    }

    if (req.query.locationState_contains) {
      opts.locationState_contains = req.query.locationState_contains;
    }

    if (req.query.published) {
      opts.published = req.query.published;
    }

    const sql = getHistoryQuery(opts);

    conn.query(sql)
    .then( (results)=> {
      const result = results[0];
      res.locals.data = result;
      return res.ok();
    })
    .catch(res.queryError);
  },

  exportUser(req, res) {
    const we = req.we;
    const conn = we.db.defaultConnection;

    const sql = getUserQuery();

    conn.query(sql)
    .then( (results)=> {
      const result = results[0];
      res.locals.data = result;
      return res.ok();
    })
    .catch(res.queryError);
  },

  exportsHistoryCountInStates(req, res) {
    const we = req.we;
    const conn = we.db.defaultConnection;

    const sql = `SELECT DISTINCT
      \`histories\`.locationState AS locationState,
      COUNT(id) AS count
       FROM histories GROUP BY locationState`;

    conn.query(sql)
    .then( (results)=> {
      const result = results[0];
      res.locals.data = result;
      return res.ok();
    })
    .catch(res.queryError);
  },

  exportsUserCountInStates(req, res) {
    const we = req.we;
    const conn = we.db.defaultConnection;

    const sql = `SELECT DISTINCT
      \`users\`.locationState AS locationState,
      COUNT(id) AS count
       FROM users GROUP BY locationState`;

    conn.query(sql)
    .then( (results)=> {
      const result = results[0];
      res.locals.data = result;
      return res.ok();
    })
    .catch(res.queryError);
  }
};

function getHistoryQuery(opts) {
  if (!opts) opts = {};

  let sql = `SELECT \`histories\`.\`id\` AS hid,
    \`histories\`.\`published\`,
    \`histories\`.\`title\`,
    \`histories\`.\`publishedAt\`,
    \`histories\`.\`publishAsAnonymous\`,
    \`histories\`.\`haveText\`,
    \`histories\`.\`haveImage\`,
    \`histories\`.\`haveVideo\`,
    \`histories\`.\`haveAudio\`,
    \`histories\`.\`country\`,
    \`histories\`.\`locationState\`,
    \`histories\`.\`city\`,
    \`histories\`.\`createdAt\`,
    \`histories\`.\`updatedAt\`,
    \`histories\`.\`historyDate\`,
    \`histories\`.\`creatorId\` AS creatorId,
    users.displayName AS creatorDisplayName,
    users.fullName AS creatorFullName,
    users.cellphone AS creatorCellphone,
    users.phone AS creatorPhone,
    users.email AS creatorEmail,
    users.cpf AS creatorCpf,
    users.passaporte AS creatorPassaporte,
    users.cep AS creatorCep,
    \`users\`.\`country\` AS creatorCountry,
    \`users\`.\`locationState\` AS creatorLocationState,
    \`users\`.\`city\` AS creatorCity,
    CA.text AS creatorActivity,
    CO.text AS creatorOrganization,
    (SELECT GROUP_CONCAT(\`terms\`.\`text\`)
    FROM modelsterms AS HTA
      LEFT JOIN terms ON terms.id = HTA.modelId
    WHERE HTA.modelName = 'history' AND
          HTA.field = 'tags' AND
            HTA.modelId = \`histories\`.id
  ) AS tags,
  \`histories\`.\`body\`
FROM histories histories
LEFT JOIN users AS users ON users.id = histories.creatorId
LEFT JOIN modelsterms AS UAA ON UAA.modelName='user' AND
             UAA.field='atividade' AND
                         UAA.modelId = histories.creatorId
LEFT JOIN modelsterms AS UOA ON UOA.modelName='user' AND
             UOA.field='atividade' AND
                         UOA.modelId = histories.creatorId
LEFT JOIN terms AS CA ON CA.id = UAA.termId
LEFT JOIN terms AS CO ON CO.id = UOA.termId`;

  let wheres = [];

  if (opts.q) {
    wheres.push(` histories.searchData LIKE "%${opts.q}%" `);
  }

  if (opts.title_contains) {
    wheres.push(` histories.title LIKE "%${opts.title_contains}%" `);
  }

  if (opts.locationState_contains) {
    wheres.push(` histories.locationState LIKE "%${opts.locationState_contains}%" `);
  }

  if (opts.published) {
    if (
      opts.published != 'false' &&
      Boolean(opts.published)
    ) {
      opts.published = 1;
    } else {
      opts.published = 0;
    }

    wheres.push(` histories.published=${opts.published} `);
  }

  if (wheres.length) {
    sql += ' WHERE ' + wheres.join('AND');
  }

  sql +=` LIMIT ${opts.limit || '15000'}`;

  return sql;
}

function getUserQuery(opts) {
  if (!opts) opts = {};

  let sql = `SELECT users.*,
  CA.text AS activity,
  CO.text AS organization
FROM users
LEFT JOIN modelsterms AS UAA ON UAA.modelName='user' AND
             UAA.field='atividade' AND
                         UAA.modelId = users.id
LEFT JOIN modelsterms AS UOA ON UOA.modelName='user' AND
             UOA.field='atividade' AND
                         UOA.modelId = users.id
LEFT JOIN terms AS CA ON CA.id = UAA.termId
LEFT JOIN terms AS CO ON CO.id = UOA.termId `;


  let wheres = [];

  if (opts['displayName_starts-with']) {
    wheres.push(` users.displayName LIKE "${opts['displayName_starts-with']}%" `);
  }

  if (opts['fullName_starts-with']) {
    wheres.push(` users.fullName LIKE "${opts['fullName_starts-with']}%" `);
  }

  if (opts['email_starts-with']) {
    wheres.push(` users.email LIKE "${opts['email_starts-with']}%" `);
  }

  if (opts['cpf_starts-with']) {
    wheres.push(` users.cpf LIKE "${opts['cpf_starts-with']}%" `);
  }

  if (opts.locationState_contains) {
    wheres.push(` users.locationState LIKE "%${opts.locationState_contains}%" `);
  }

  if (wheres.length) {
    sql += ' WHERE ' + wheres.join('AND');
  }

  sql += ` LIMIT ${opts.limit || '15000'}`;

  return sql;
}