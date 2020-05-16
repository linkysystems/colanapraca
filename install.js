module.exports = {
  /**
   * Install function run in we.js project install.
   *
   * @param  {Object}   we    we.js object
   * @param  {Function} done  callback
   */
  install(we, done) {
    we.log.info('Starting project install...');

    const fns = [];
    let u;

    fns.push(function registerUser1(done) {
      const user1 = {
        username: 'admin',
        email: 'alberto@linkysystems.com',
        password: '123', // change after install
        displayName: 'Administrator',
        fullName: 'Administrator LinuxMan',
        cpf: '13044479797',
        active: true,
        roles: ['administrator']
      };

      we.log.info('I will create the user: ', {
        user: user1
      });

      we.db.models.user.findOrCreate({
        where: { email: user1.email },
        defaults: user1
      })
      .spread( (user)=> {
        u = user;
        we.log.info('New User with id: ', {
          id: user.id
        });
        // install we-plugin-auth for use password
        if (!we.db.models.password) {
          return done();
        }
        // set the password
        return we.db.models.password.create({
          userId: user.id,
          password: user1.password,
          confirmPassword: user1.password
        })
        .then( ()=> {
          return done();
        });
      })
      .catch(done);
    });

    fns.push(function registerUser2(done) {
      const user1 = {
        username: 'alberto',
        email: 'contato@albertosouza.net',
        cpf: '73346725693',
        password: '123', // change after install
        displayName: 'Alberto',
        fullName: 'Alberto Souza Santos Júnior',
        gender: 'M',
        cellphone: '(21) 97643-4196',
        phone: '(21) 3654-8862',
        cep: '25251-397',
        organization: ['Linky Systems'],
        biography: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in iaculis ipsum, et interdum nibh. Nullam rutrum, ex non viverra pellentesque, est tellus auctor ex, non suscipit magna metus eu ipsum. Phasellus vitae iaculis magna. Nulla libero nulla, tincidunt sed aliquam eget, commodo eu nulla. Nam vel ante ipsum. Donec ac nibh malesuada, rhoncus enim ut, elementum purus. Morbi ut purus ut nibh imperdiet imperdiet sit amet et massa. Aliquam condimentum molestie quam vel placerat. In dapibus rutrum tincidunt. Suspendisse sodales posuere nisl sed blandit.</p>\r\n<p>Quisque rhoncus metus vel tortor egestas scelerisque. Aenean lobortis consequat urna, sed sollicitudin erat iaculis et. Nulla quis laoreet mauris. In a dolor in justo aliquet placerat sit amet vel arcu. Aenean et diam lorem. Donec vitae quam fringilla velit pretium malesuada eu id tellus. Maecenas et lorem condimentum urna fermentum auctor at at nunc. Maecenas rutrum volutpat nulla, in sagittis lectus fermentum sit amet. Integer condimentum nisi ac lectus suscipit, vitae finibus massa ultrices. Proin tempor tincidunt posuere. Integer lacinia sem ante, sed congue mi facilisis nec. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>\r\n<p>Proin id quam mattis, semper lorem sit amet, malesuada erat. Vivamus iaculis a magna nec volutpat. Suspendisse et nisl libero. Etiam auctor risus velit, a gravida orci eleifend in. Ut mollis magna porttitor lacus egestas, et feugiat nunc accumsan. Sed tincidunt bibendum suscipit. Aliquam at suscipit lorem, vel euismod felis. Curabitur libero ligula, vestibulum eu cursus vitae, consectetur quis purus. Morbi mattis arcu ut consequat posuere. Sed mauris urna, commodo sed velit in, condimentum accumsan erat. Phasellus dignissim at urna ornare maximus. Nunc dictum mi vel nulla maximus elementum. Sed dictum et risus quis pulvinar. Curabitur velit nulla, placerat id ipsum in, maximus consectetur orci. Cras ac velit ac erat tincidunt ultrices.</p>\r\n<p>Aliquam malesuada interdum nunc, id rhoncus metus feugiat blandit. Nam tincidunt urna sit amet laoreet ornare. Proin sem lectus, blandit ut varius sit amet, molestie in lectus. Ut felis nibh, pharetra in turpis id, molestie semper nibh. Mauris laoreet vitae nisl nec tincidunt. Curabitur condimentum lacus sed tincidunt posuere. Nulla elit massa, mattis at molestie eu, condimentum eget mauris. Vestibulum sodales sapien id sem dictum posuere. Nulla mattis magna in ornare luctus.</p>`,
        active: true,
        acceptTerms: true,
        roles: []
      };

      we.log.info('I will create the user: ', {
        user2: user1
      });

      we.db.models.user.findOrCreate({
        where: { email: user1.email },
        defaults: user1
      })
      .spread( (user)=> {
        we.log.info('New User with id: ', user.id);
        // install we-plugin-auth for use password
        if (!we.db.models.password) {
          return done();
        }
        // set the password
        return we.db.models.password.create({
          userId: user.id,
          password: user1.password,
          confirmPassword: user1.password
        })
        .then( ()=> {
          return done();
        });
      })
      .catch(done);
    });

    fns.push(function createCertificationTemplates(done) {
      we.db.models['certification-template']
      .create({
        identifier: 'history-published',
        name: 'Histórias publicadas',
        text: '',
        textPosition: 'middle',
        published: true
      })
      .then( ()=> {
        we.log.info('Certification templates created');
        return done();
      })
      .catch(done);
    });

    fns.push(function registerHomeSlideshow(done) {
      const data = {
        name: 'Home slideshow',
        creatorId: u.id
      };

      we.db.models.slideshow.create(data)
      .then( ()=> {
        return done();
      })
      .catch(done);
    });

    fns.push(function createDefaultMenus(done) {
      we.utils.async.series([
        function createMainMenu(done) {
          we.db.models.menu.create({
            name: 'main',
            class: 'main-menu'
          })
          .then(function (r){
            we.log.info('New menu with name: '+r.name+' and id: '+r.id);
            // then create menu links
            we.db.models.link.bulkCreate([
              {
                'href': '/',
                'text': 'Início',
                class: 'link-home',
                'type': 'custom',
                'depth': 0,
                'weight': 1,
                menuId: r.id
              },
              {
                'href': '/sobre',
                'text': 'Sobre',
                class: 'link-about',
                'title': 'About',
                'depth': 0,
                'weight': 2,
                menuId: r.id
              },
              {
                'href': '/historias',
                'text': 'Histórias',
                class: 'link-history',
                'type': 'custom',
                'depth': 0,
                'weight': 3,
                menuId: r.id
              },
              {
                'href': '/mostras',
                'text': 'Mostras',
                class: 'link-mostras',
                'type': 'custom',
                'depth': 0,
                'weight': 4,
                menuId: r.id
              },
              {
                'href': '/noticias',
                'text': 'Blog',
                class: 'link-news',
                'type': 'custom',
                'depth': 0,
                'weight': 5,
                menuId: r.id
              },
              {
                'href': '/site-contact',
                'text': 'Contato',
                class: 'link-news',
                'type': 'custom',
                'depth': 0,
                'weight': 6,
                menuId: r.id
              },
              {
                'href': '/history/create',
                'text': 'Participar',
                class: 'link-create-history',
                'type': 'custom',
                'depth': 0,
                'weight': 7,
                menuId: r.id
              },
              {
                'href': '/login',
                'text': 'Entrar',
                class: 'link-login',
                'userRole': 'unAuthenticated',
                'depth': 0,
                'weight': 8,
                menuId: r.id
              }
            ])
            .then( ()=> {
              done();
              return null;
            })
            .catch(done);
            return null;
          })
          .catch(done);
        },
        function createSocialMenu(done) {
          we.db.models.menu.create({
            name: 'social',
            class: ''
          })
          .then( (r)=> {
            we.log.info('New menu with name: '+r.name+' and id: '+r.id);
            // then create menu links
            we.db.models.link.bulkCreate([
              {
                href: '#',
                text: '<i class="fa fa-facebook"></i>',
                title: 'Facebook',
                menuId: r.id
              },
              {
                href: '#',
                text: '<i class="fa fa-twitter"></i>',
                title: 'Twitter ',
                menuId: r.id
              },
              {
                href: '#',
                text: '<i class="fa fa-medium"></i>',
                title: 'Medium ',
                menuId: r.id
              },
              {
                href: '#',
                text: '<i class="fa fa-instagram"></i>',
                title: 'Instagram',
                menuId: r.id
              },
              {
                href: '#',
                text: '<i class="fa fa-soundcloud"></i>',
                title: 'SoundCloud',
                menuId: r.id
              },
              {
                href: '#',
                text: '<i class="fa fa-youtube"></i>',
                title: 'Youtube',
                menuId: r.id
              }
            ])
            .then(()=> {
              return done();
            })
            .catch(done);

            return null;
          })
          .catch(done);
        }
      ], done);
    });

    fns.push(function createFirstPages(done) {
      we.db.models.content
      .create({
        artive: true,
        published: true,
        showInLists: true,
        title: 'Quem somos',
        about: 'Página com as informações sobre a organização',
        body: 'Digite o texto sobre a organização aqui ...',
        publishedAt: new Date(),
        allowComments: false,
        category: 'Página',
        setAlias: 'sobre'
      })
      .then( ()=> {
        we.log.info('First contents created');
        done();
        return null
      })
      .catch(done);
    });

    fns.push(function createVocabulary(done) {
      we.db.models.vocabulary
      .bulkCreate([{
        name: 'Organization',
        description: 'Organizações registradas'
      }, {
        name: 'Professional Activity',
        description: 'Atividade profícional'
      }])
      .spread( ()=> {
        we.log.info('First vocabularies created');
        done();
        return null;
      })
      .catch(done);
    });

    fns.push(function createTermAlias(done) {
      we.db.models['url-alia']
      .bulkCreate([{
        alias: '/historias',
        target: '/history',
        locale: 'pt-BR'
      }, {
        alias: '/noticias',
        target: '/news',
        locale: 'pt-BR'
      }])
      .spread( ()=> {
        we.log.info('First url alias created');
        done();
        return null
      })
      .catch(done);
    });

    fns.push(function createFirstSettings(done) {
      we.db.models['system-setting']
      .bulkCreate([{
        key: 'siteName',
        value: 'Teatro da Saúde',
      }, {
        key: 'siteDescription',
        value: `Versão digital do Mostra 'Teatro da saúde - Vivências no Território`,
      }, {
        key: 'emailContact',
        value: `nao-responda <alberto@linkysystems.com>`,
      }, {
        key: 'menuMainId',
        value: '1'
      }, {
        key: 'menuSocialId',
        value: '2'
      }])
      .spread( ()=> {
        we.log.info('First system-setting created');
        done();
        return null
      })
      .catch(done);
    });

    fns.push(function registerLocations(done) {
      we.log.info('Register all locations init');
      let p = we.projectPath + '/node_modules/we-plugin-location/bin/registerAllLocations.js';
      const rl = require(p);
      rl.saveLocations(we, (err)=> {
        if (err) {
          we.log.error('Error on register all locations');
        }

        we.log.info('Register all locations done');
        done();
      });
    });

    we.utils.async.series(fns, done);
  },
  updates: require('./updates.js')
};
