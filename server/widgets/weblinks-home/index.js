module.exports = function (projectPath, Widget) {
  let widget = new Widget('weblinks-home', __dirname);

  widget.viewMiddleware = function(w, req, res, next) {
    const flag = req.we.db.models.flag;
    const async = req.we.utils.async;
    let userId;

    if (req.user) {
      userId = req.user.id
    } else {
      userId = null
    }

    req.we.db.models['web-link'].findAll({
      where: {
        // published: true
      },
      order: [['publishedAt', 'DESC'], ['id', 'DESC']],
      include: [
        { as: 'creator', model: req.we.db.models.user }
      ],
      limit: 6
    })

    .then((records)=> {
      const functions = [];

      functions.push( (done)=> {
        // load current user flag status for records in lists
        async.each(records, (record, next)=> {
          if (!record.metadata) record.metadata = {};

         flag.getCountAndUserStatus(userId, 'web-link', record.id, 'like', (err, result)=> {
           if (err) return next(err);

           record.metadata.isFlagged = result.isFlagged;
           record.metadata.flagCount = result.count;
           next();

         });
        }, done);
      });

      return new Promise((resolve, reject)=> {
        async.series(functions, (err)=> {
          if (err) reject(err);
          resolve(records);
        });
      });
    })
    .then( (r)=> {
      w.records = r;

      return next();
    })
    .catch(next)
  }

  return widget;
};