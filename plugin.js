/**
 * We.js plugin file, use to load routes and configs
 *
 * @param  {String} projectPath current project path
 * @param  {Object} Plugin      we.js Plugin class
 * @return {Object}             intance of we.js Plugin class
 */

const path = require('path'),
  metatagContentFindAll = require('./lib/metatags/metatagContentFindAll.js'),
  metatagContentFindOne = require('./lib/metatags/metatagContentFindOne.js'),
  metatagHistoryFindAll = require('./lib/metatags/historyFindAll.js'),
  metatagHistoryFindOne = require('./lib/metatags/historyFindOne.js'),
  generateHistoryCertification = require('./lib/generateHistoryCertification.js');

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.generateHistoryCertification = require('./lib/generateHistoryCertification.js');

  plugin.setConfigs({
    permissions: {
      'access_contents_unpublished': {
        'title': 'Access unpublished contents'
      },
      'view_dashboard': { title: '' },
      'edit_terms_of_use': { title: '' },
      'generate_reports': {
        title: 'Generate reports in admin'
      }
    },

    certification: {
      textPositions: {
        middle: { l: 102, t: 273,
          options: {
            width: 440,
          },
          fontSize: 18
        },
        left: { l: 30, t: 150 },
        right: { l: 400, t: 150 }
      }
    },

    API_KEYS: {
      youtube: {
        client_id: null,
        client_secret: null,
        redirect_uri: null
      }
    },

    forms: {
      'login': __dirname + '/server/forms/login.json',
      'register': __dirname + '/server/forms/register.json',
      'complete-registration': __dirname + '/server/forms/complete-registration.json',
      'history-create': __dirname + '/server/forms/history-create.json',
      'history1': __dirname + '/server/forms/history1.json',
      'history-text': __dirname + '/server/forms/history-text.json',
      'history2': __dirname + '/server/forms/history2.json',
      'history3': __dirname + '/server/forms/history3.json',
      'history4': __dirname + '/server/forms/history4.json',
      'history5': __dirname + '/server/forms/history5.json'
    },

    menu: {
      authenticatedUserMenu(req) {
        return {
          links: [
          {
            id: 'user',
            href: '/user/' + req.user.id,
            text: req.user.displayName || '#'+req.user.id,
            class: null,
            weight: 3,
            dividerAfter: true
          },
          {
            id: 'myHistoryView',
            href: '/user/' + req.user.id,
            text: '<i class="glyphicon glyphicon-picture"></i> Minhas histórias',
            class: null,
            weight: 2,
            parent: 'user'
          },
          {
            id: 'userProfileView',
            href: '/user/' + req.user.id,
            text: '<i class="glyphicon glyphicon-user"></i> '+
              req.__('user.profile.view'),
            class: null,
            weight: 3,
            parent: 'user',
            dividerAfter: true
          },
          {
            id: 'userProfileEdit',
            href: '/user/' + req.user.id + '/edit',
            text: '<i class="glyphicon glyphicon-pencil"></i> '+
              req.__('user.profile.edit'),
            class: null,
            weight: 5,
            parent: 'user'
          },
          {
            id: 'userProfileEditPrivacity',
            href: '/user/' + req.user.id + '/edit/privacity',
            text: '<i class="glyphicon glyphicon-alert"></i> '+
              req.__('Privacity'),
            class: null,
            weight: 5,
            parent: 'user'
          },
          {
            id: 'userChangePassword',
            href: '/auth/change-password',
            text: '<i class="glyphicon glyphicon-lock text-warning"></i> '+
              req.__('auth.change-password'),
            class: null,
            weight: 7,
            parent: 'user',
            dividerAfter: true
          },
          {
            id: 'logout',
            href: '/auth/logout',
            text: '<i class="glyphicon glyphicon-log-out text-danger"></i> '+
              req.__('Logout'),
            class: null,
            weight: 9,
            parent: 'user',
            dividerAfter: true
          }
          ]
        };
      }
    },

    emailTypes: {
      newUserEmail: {
        label: 'E-mail de boas vindas após o usuário se cadastrar no site',
        defaultSubject: `Bem vindo(a) ao site {{siteName}}`,
        defaultHTML: `<p>O seu cadastro no site do <i><a href="{{siteUrl}}">{{siteName}}</a></i> foi realizado com sucesso!</p>
<p>Caso queira editar ou completar algumas informações sobre você, acesse o seu perfil no site do <i><a href="{{userEditProfileURL}}">{{siteName}}</a></i> ou clique no link abaixo:</p>
<p>{{userEditProfileURL}}</p>
<p>Muito obrigada por participar!</p>
<p><br />Atenciosamente,<br />{{siteName}}<br />{{siteUrl}}</p>`,
        defaultText: `O seu cadastro no site do {{siteName}} foi realizado com sucesso!

Caso queira editar ou completar algumas informações sobre você, acesse o seu perfil no site do {{siteName}} ou clique no link abaixo:

{{userEditProfileURL}}

Muito obrigada por participar!

Atenciosamente,
{{siteName}}
{{siteUrl}}`,
        templateVariables: {
          displayName: {
            example: 'Alberto',
            description: 'Nome de exibição do novo usuário'
          },
          email: {
            example: 'alberto@linkysystems.com',
            description: 'E-mail do novo usuário'
          },
          siteName: {
            example: 'Site Name',
            description: 'Nome desse site'
          },
          siteUrl: {
            example: plugin.we.config.hostname,
            description: 'URL desse site'
          },
          userEditProfileURL: {
            example: plugin.we.config.hostname+'/user/1/edit',
            description: 'URL para edição do perfil do usuário'
          },
        }
      },
      newHistoryEmail: {
        label: 'E-mail confirmação de envio de história antes de ser publicada',
        defaultSubject: `Sua história {{historyTitle}} foi enviada com sucesso`,
        defaultHTML: `<p>Sua história '{{historyTitle}}' foi enviada com sucesso e encaminhada para a nossa triagem.<br>
Em breve avisaremos quando sua história for publicada.</p>
<p>O <i><a href="{{siteUrl}}">{{siteName}}</a></i> agradece a sua participação.</p>
<p><br />Atenciosamente,<br />{{siteName}}<br />{{siteUrl}}</p>`,
        defaultText: `Sua história '{{historyTitle}}' foi enviada com sucesso e encaminhada para a nossa triagem.
Em breve avisaremos quando sua história for publicada.

O {{siteName}} agradece a sua participação.


Atenciosamente,
{{siteName}}
{{siteUrl}}`,
        templateVariables: {
          displayName: {
            example: 'Alberto',
            description: 'Nome de exibição do novo usuário'
          },
          email: {
            example: 'alberto@linkysystems.com',
            description: 'E-mail do novo usuário'
          },
          siteName: {
            example: 'Site Name',
            description: 'Nome desse site'
          },
          siteUrl: {
            example: plugin.we.config.hostname,
            description: 'URL desse site'
          },
          historyTitle: {
            example: 'Outubro Rosa em Santa Rita do Tocantins',
            description: 'Título da história'
          },
          historyCreatedAt: {
            example: '20/05/2018',
            description: 'Data de envio da história'
          },
          historyId: {
            example: '1000',
            description: 'ID da história'
          },
          historyUrl: {
            example: 'http://...',
            description: 'Url para a história'
          }
        }
      },
      historyPublishedEmail: {
        label: 'E-mail de aviso de história publicada com sucesso',
        defaultSubject: `Sua história {{historyTitle}} foi publicada!`,
        defaultHTML: `<p>Sua história '<a href="{{historyUrl}}">{{historyTitle}}</a>' ,enviada para <i><a href="{{siteUrl}}">{{siteName}}</a></i> já está NO AR!</p>
<p>Compartilhe ela em suas redes!</p>
<p>O <i><a href="{{siteUrl}}">{{siteName}}</a></i>  agradece a sua participação e aguarda o envio de mais histórias das suas vivências nos territórios.</p>
<p>Link: {{historyUrl}}</p>
<p><br />Atenciosamente,<br />{{siteName}}<br />{{siteUrl}}</p>`,
        defaultText: `Sua história '{{historyTitle}}' ,enviada para {{siteName}} já está NO AR!

Compartilhe ela em suas redes!

O {{siteName}} agradece a sua participação e aguarda o envio de mais histórias das suas vivências nos territórios.

Link: {{historyUrl}}

Atenciosamente,
{{siteName}}
{{siteUrl}}`,
        templateVariables: {
          displayName: {
            example: 'Alberto',
            description: 'Nome de exibição do novo usuário'
          },
          email: {
            example: 'alberto@linkysystems.com',
            description: 'E-mail do novo usuário'
          },
          siteName: {
            example: 'Site Name',
            description: 'Nome desse site'
          },
          siteUrl: {
            example: plugin.we.config.hostname,
            description: 'URL desse site'
          },
          historyTitle: {
            example: 'Outubro Rosa em Santa Rita do Tocantins',
            description: 'Título da história'
          },
          historyCreatedAt: {
            example: '20/05/2018',
            description: 'Data de envio da história'
          },
          historyPublishedAt: {
            example: '20/05/2018',
            description: 'Data de publicação da história'
          },
          historyId: {
            example: '1000',
            description: 'ID da história'
          },
          historyUrl: {
            example: 'http://...',
            description: 'Url para a história'
          }
        }
      }
    }
  });

  plugin.setRoutes({
    'get /': {
      'controller': 'main',
      'action': 'index',
      'template': 'home/index',
      titleHandler(req, res, next) {
        res.locals.title = '';
        return next();
      }
    },
    'post /newsletter/subscribe': {
      controller: 'newsletter',
      action: 'subscribe',
      responseType: 'json'
    },

    'get /complete-registration': {
      controller: 'main',
      action: 'completeRegistration',
      template: 'user/complete-registration'
    },
    'post /complete-registration': {
      controller: 'main',
      action: 'completeRegistration',
      template: 'user/complete-registration'
    },

    // 'get /user/:userId/certification': {
    //   name: 'user.certification',
    //   title: 'Certificados',
    //   controller: 'certification',
    //   action: 'find',
    //   template: 'user/certification'
    // },
    // 'get /history/:userId/certification': {
    //   name: 'history.certification',
    //   title: 'Gerar certificado',
    //   controller: 'certification',
    //   action: 'generate'
    // }

    'get /exports/history.csv': {
      controller: 'report',
      action: 'exportHistory',
      permission: 'generate_reports'
    },
    'get /exports/user.csv': {
      controller: 'report',
      action: 'exportUser',
      permission: 'generate_reports'
    },

    'get /exports/history-count-in-states': {
      controller: 'report',
      action: 'exportsHistoryCountInStates',
      permission: 'generate_reports'
    },

    'get /exports/user-count-in-states': {
      controller: 'report',
      action: 'exportsUserCountInStates',
      permission: 'generate_reports'
    },

    'post /history/:id/publish': {
      controller: 'history',
      action: 'publish',
      responseType: 'json',
      permission: 'publish_history'
    }
  });

  plugin.setResource({
    name: 'history',
    findAll: {
      metatagHandler: 'historyFindAll',
      search: {
        published: {
          parser: 'equalBoolean',
          target: {
            type: 'field',
            field: 'published'
          }
        }
      }
    },
    findOne: { metatagHandler: 'historyFindOne' }
  });

  plugin.setResource({ name: 'certification' });
  plugin.setResource({ name: 'certification-template' });

  plugin.setResource({
    name: 'content',
    findAll: {
      metatagHandler: 'contentFindAll',
      search: {
        published: {
          parser: 'equalBoolean',
          target: {
            type: 'field',
            field: 'published'
          }
        }
      }
    },
    findOne: { metatagHandler: 'contentFindOne' }
  });

  plugin.setResource({ name: 'contributor' });

  plugin.setMetatagHandlers = function setMetatagHandlers(we) {
    if (we.router.metatag) {
      // override default metatag handler for all routes:
      we.router.metatag.add('default', require('./lib/metatags/default.js'));
      we.router.metatag.add('contentFindOne', metatagContentFindOne);
      we.router.metatag.add('contentFindAll', metatagContentFindAll);
      we.router.metatag.add('historyFindOne', metatagHistoryFindOne);
      we.router.metatag.add('historyFindAll', metatagHistoryFindAll);
    }
  }

  plugin.hooks.on('we-plugin-user-settings:getCurrentUserSettings', (ctx, done)=> {
    // ctx = {req: req,res: res,data: data}
    plugin.we.db.models['system-setting']
    .findAll()
    .then( (r)=> {
      ctx.data.systemSettings = {};

      if (r) {
        r.forEach( (setting)=> {
          ctx.data.systemSettings[setting.key] = setting.value;
        });
      }

      done();
      return null;
    })
    .catch(done);
  });

  plugin.hooks.on('we-plugin-user-settings:getCurrentUserSettings', (ctx, done)=> {
    // ctx = {req: req,res: res,data: data}
    ctx.data.userPermissions = {};

    if (ctx.req.userRoleNames.indexOf('administrator') > -1) {
      // skip if user id admin:
      return done();
    }

    for (let permission in plugin.we.acl.permissions) {

      if (plugin.we.acl.canStatic(permission, ctx.req.userRoleNames)) {
        ctx.data.userPermissions[permission] = true;
      }
    }

    done();
  });

  plugin.bindCPFRequirementRoute = function(we) {
    we.express.use(function(req, res, next) {
      if (
        req.isAuthenticated() &&
        !req.user.allRequirementsMet &&
        ( req.originalUrl == '/' || req.originalUrl == '/history/create' )
      ) {
        return res.goTo('/complete-registration');
      }

      next();
    });
  }

  plugin.events.on('we:after:load:passport', plugin.bindCPFRequirementRoute);

  plugin.events.on('we:after:load:express', (we)=> {

    if (we.env == 'dev') {
      // Allows cross domain Credentials in ajax
      we.express.use((req, res, next)=>{
        res.set('Access-Control-Allow-Credentials', 'true');
        next();
      });
    }

    we.express.use('/history', (req, res, next)=> {
      if (!req.query.view) return next();
      req.we.db.models['imported-history']
      .findOne({
        where: { eid: String(req.query.view) }
      })
      .then( (ih)=> {
        if (ih && ih.historyId) {
          res.goTo('/history/'+ih.historyId);
        } else {
          next();
        }
        return null;
      })
      .catch(next);
    });

    we.express.use('/narrador', (req, res, next)=> {
      if (!req.query.view) return next();
      req.we.db.models['imported-user']
      .findOne({
        where: { eid: String(req.query.view) }
      })
      .then( (ih)=> {
        if (ih && ih.userId) {
          res.goTo('/user/'+ih.userId);
        } else {
          next();
        }
        return null;
      })
      .catch(next);
    });

    we.express.use(plugin.iframeClassMD);
  });

  plugin.iframeClassMD = function iframeClassMD(req, res, next) {
    if (req.query.iframe) {
      res.locals.iframeClass = 'iframe-page-type';
    } else {
      res.locals.iframeClass = '';
    }
    next();
  }

  plugin.events.on('we:after:load:plugins', plugin.setMetatagHandlers);

  plugin.events.on('we:after:load:express', (we)=> {
    const adminFiles = path.join( __dirname, 'client/admin/prod');
    we.express.use('/admin', we.utils.express.static(adminFiles));
  });

  plugin.hooks.on('we:models:before:instance', function (we, done) {
    const brasil = we.gov.br;

    // o usuário deve preencher o CPF ou o Passaporte de acordo com a flag que diz se ele é brasileiro ou não

    // setando o campo de cpf
    we.db.modelsConfigs.user.definition.cpf = {
      type: we.db.Sequelize.STRING(11),
      unique: true,
      allowNull: true,
      // formFieldType: 'gov-br/cpf',
      formFieldType: null,
      set(val) {
        if (val) {
          // remove a mascara de cpf ao setar o valor
          this.setDataValue('cpf', brasil.removeMask(val));
        } else {
          this.setDataValue('cpf', null);
        }
      },
      validate: {
        cpfIsValid(val) {
          if (val && !brasil.CPF.isValid(val)) throw new Error('user.cpf.invalid');
        }
      }
    }

    we.db.modelsConfigs.user.definition.estrangeiro = {
      type: we.db.Sequelize.BOOLEAN,
      defaultValue: false,
      // formFieldType: 'gov-br/brasileiro-seletor',
      formFieldType: null,
      set(val) {
        if (!val) this.setDataValue('estrangeiro', null);
        if ( Number(val) )
          this.setDataValue('estrangeiro', Number(val) );
        this.setDataValue('estrangeiro', null);
      }
    }

    done();
  });

  plugin.hooks.on(
    'history:published:after',
    generateHistoryCertification
  );

  return plugin;
};