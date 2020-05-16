const path = require('path');

module.exports = {
  appName: 'Site',
  subtitle: 'Nome do site',
  systemSettingsPubSubStrategy: 'redis',

  // queryDefaultLimit: 9,

  googleApi: {
    scopes: {
      'https://www.googleapis.com/auth/drive.file': true,
      'https://www.googleapis.com/auth/youtube.upload': true,
      'https://www.googleapis.com/auth/youtube': true
    }
  },

  // default favicon, change in your project config/local.js
  favicon: path.resolve(__dirname, '..', 'files/public/favicon.ico'),
  // logo public url path
  appLogo: '/public/project/logo.jpg',

  site: {
    homeBg :'/public/project/home-bg.jpg'
  },

  notification: {
    /**
     * time to wait after an notification is created to send in  notification email
     * @type {Object}
     */
    waitMinutesForSendEmail: 10
  },

  passport: {
    expiresTime: 31536000000,

    strategies: {
      facebook: {
        clientID: 'TODO',
        clientSecret: 'TODO'
      },

      local: {
        session: true,
        findUser(email, password, done) {
          console.log('rodo!', email);
          const we = this.we;
          // build the find user query with support to email or cpf
          let query = {
            where: {
              [we.Op.or]: [{
                email: email
              }, {
                cpf: email
              }]
            }
          };

          // find user in DB
          we.db.models.user
          .find(query)
          .then ( (user)=> {
            if (!user) {
              done(null, false, { message: 'auth.login.wrong.email.or.password' });
              return null;
            } else if (user.blocked) {
              done(null, false, { message: 'auth.login.user.blocked' });
              return null;
            }
            // get the user password
            return user.getPassword()
            .then( (passwordObj)=> {
              if (!passwordObj) {
                done(null, false, { message: 'auth.login.user.dont.have.password' });
                return null;
              }

              passwordObj.validatePassword(password, (err, isValid)=> {
                if (err) return done(err);
                if (!isValid) {
                  return done(null, false, { message: 'auth.login.user.incorrect.password.or.email' });
                } else {
                  return done(null, user);
                }
              })

              return null;
            })
          })
          .catch(done);
        }
      }
    }
  },

  fileHostname: '',
  fileImageHostname: '',

  acl: {
    disabled: false
  },

  enableRequestLog: false,
  upload: {
    // defaultImageStorage: null,
    // defaultFileStorage: null,

    defaultVideoStorage: 'youtube',

    image: {
      avaibleStyles: [
        'thumbnail',
        'medium',
        'large',
        'banner',
        'bannerbig',
        'slide',
        'eventBanner'
      ],
      styles: {
        thumbnail: { width: '75', heigth: '75' },
        medium: { width: '250', heigth: '250' },
        large: { width: '640', heigth: '400' },
        banner: { width: '900', heigth: '300' },
        bannerbig: { width: '1920', heigth: '650' },
        slide: { width: '1620', heigth: '1080' },
        eventBanner: { width: '1920', heigth: '250' }
      }
    }
  },

  queryDefaultLimit: 15,
  latestCommentLimit: 4,// limit for preloaded comments
  comments: {
    models:  {
      // enable comments in models:
      post: true,
      content: true,
      article: true,
      cfnews: true
    }
  },

  flag: {
    models: {
      post: true
    }
  },

  follow: {
    models: {
      post: true
    }
  },

  csv: {
    modelColumns: {
      history: {
        id: 'historyId',
        title: 'title',
        published: 'published',
        city: 'city',
        'creator.id': 'creatorId',
        creator: {
          id: 'x'
        }
      },
      user: {
        userId: 'userId',
        displayName: 'displayName',
        fullName: 'fullName',
        biography: 'biography',
        gender: 'gender'
      }
    }
  }
};