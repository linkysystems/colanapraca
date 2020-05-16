/**
 * Main project controller
 *
 */

module.exports = {
  index(req, res) {
    res.locals.data = { online: true };
    res.ok();
    return null;
  },

  termsOfUse(req, res) {

    if (!req.we.systemSettings)  {
      return req.badRequest('System settings plugin is required for use terms of use page');
    }

    const ss = req.we.systemSettings;

    if ( !ss.termOfUseId || !ss.termOfUseModel ) {
      return res.goTo('/');
    }

    return res.goTo('/'+ss.termOfUseModel+'/'+ss.termOfUseId);
  },

  completeRegistration(req, res) {
    if (!req.isAuthenticated()) return res.forbidden();

    if (req.user.allRequirementsMet) {
      return res.goTo('/user/'+req.user.id);
    }

    res.locals.data = req.user;
    req.we.utils._.merge(res.locals.data, req.body);

    if (req.method == 'POST') {
      req.user.updateAttributes(req.body)
      .then(function afterUpdate () {
        if (req.user.allRequirementsMet) {
          return res.goTo('/user/'+req.user.id);

        } else {
          res.addMessage('warning', {
            text: 'fill.all.fields'
          });
          return res.ok();
        }
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  }
};