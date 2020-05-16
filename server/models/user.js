/**
 * User model
 *
 * @module      :: Model
 */

// const userNameRegex = /^[A-Za-z0-9_-]{2,30}$/;

module.exports = function UserModel(we) {
  const model = {
    definition: {
      haveAvatar: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      username: { // deprecated!
        type: we.db.Sequelize.STRING,
        formFieldType: null,
      },
      displayName: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      fullName: {
        type: we.db.Sequelize.TEXT,
        formFieldType: 'text',
        allowNull: false
      },

      publishedHistoryCount: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        formFieldType: null
      },

      biography: {
        type: we.db.Sequelize.TEXT,
        formFieldType: 'html',
        formFieldHeight: 200
      },

      gender: {
        type: we.db.Sequelize.STRING,
        programaçãoformFieldType: 'select' ,
        fieldOptions: { M: 'Male', F: 'Female' }
      },

      email: {
        // Email type will get validated by the ORM
        type: we.db.Sequelize.STRING,
        allowNull: false,
        unique: true,
        formFieldType: 'user-email',
        validate: {
          isEmail: true,
          notEmptyOnCreate(val) {
            if (this.isNewRecord) {
              if (!val) {
                throw new Error('auth.register.email.required');
              }
            }
          },
          equalEmailFields(val) {
            if (this.isNewRecord) {
              if (this.getDataValue('email') != val) {
                throw new Error('auth.email.and.confirmEmail.diferent');
              }
            }
          },
          uniqueEmail(val, cb) {
            return we.db.models.user
            .findOne({
              where: { email: val }, attributes: ['id']
            })
            .then( (u)=> {
              if (u) return cb('auth.register.email.exists');
              cb();
              return null;
            })
            .catch(cb);
          }
        }
      },

      cellphone: {
        type: we.db.Sequelize.STRING,
        allowNull: true,
        formFieldType: 'phone/cell'
      },

      phone: {
        type: we.db.Sequelize.STRING,
        allowNull: true,
        formFieldType: 'phone/cell'
      },

      active: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },

      allRequirementsMet: {
        type: we.db.Sequelize.VIRTUAL,
        formFieldType: null,
        get() {
          if (
            this.get('email') &&
            this.get('displayName') &&
            this.get('cpf') &&
            this.get('cellphone') &&
            this.get('country') &&
            this.get('locationState') &&
            this.get('city')
          ) {
            return true;
          }
          return false;
        }
      },

      language: {
        type: we.db.Sequelize.STRING,
        defaultValue: 'pt-br',
        validations: {
          max: 6
        },
        formFieldType: null // TODO
      },
      confirmEmail: {
        type: we.db.Sequelize.VIRTUAL,
        formFieldType: null,
        set(val) {
          this.setDataValue('confirmEmail', val);
        },
        validate: {
          isEmail: true,
          notEmptyOnCreate(val) {
            if (this.isNewRecord) {
              if (!val) {
                throw new Error('auth.register.confirmEmail.required');
              }
            }
          },
          equalEmailFields(val) {
            if (this.isNewRecord) {
              if (this.getDataValue('email') != val) {
                throw new Error('auth.email.and.confirmEmail.diferent');
              }
            }
          }
        }
      },
      acceptTerms: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: true,
        equals: true,
        allowNull: false,
        formFieldType: null
      },

      locationText: {
        type: we.db.Sequelize.VIRTUAL,
        formFieldType: null,
        get() {

          const p = this.get('country');
          if (!p) return '';

          const s = this.get('locationState')
          const c = this.get('city');

          if (c) {
            return s +' / '+ c;
          }

          if (s) {
            return p +' / '+ s;
          }

          return p;
        }
      },

      setAlias: {
        type: we.db.Sequelize.VIRTUAL,
        formFieldType: null
      }
    },
    associations: {},
    options: {
      enableAlias: false,
      titleField: 'displayName',
      termFields: {
        organization: {
          vocabularyName: 'Organization',
          canCreate: true,
          formFieldMultiple: false,
          onlyLowercase: false
        },
        atividade: {
          vocabularyName: 'Professional Activity',
          canCreate: true,
          formFieldMultiple: false,
          onlyLowercase: true
        },
      },
      imageFields: {
        avatar: {
          formFieldMultiple: false
        },
        banner: {
          formFieldMultiple: false
        }
      },

      // table comment
      comment: 'We.js users table',

      classMethods: {
        validUsername(username){
          const restrictedUsernames = [
            'logout',
            'login',
            'auth',
            'api',
            'admin',
            'account',
            'user'
          ];

          if (restrictedUsernames.indexOf(username) >= 0) {
            return false;
          }
          return true;
        },
        /**
         * Context loader, preload current request record and related data
         *
         * @param  {Object}   req  express.js request
         * @param  {Object}   res  express.js response
         * @param  {Function} done callback
         */
        contextLoader(req, res, done) {
          if (!res.locals.id || !res.locals.loadCurrentRecord) return done();

          if (res.locals.user) {
            res.locals.data = res.locals.user;

            if (
              res.locals.data.id &&
              req.isAuthenticated &&
              req.isAuthenticated()
            ) {
              // ser role owner
              if (req.user.id == res.locals.data.id) {
                if(req.userRoleNames.indexOf('owner') == -1 ) req.userRoleNames.push('owner');
              }
            }

            done();
          } else {
            this.findById(res.locals.id)
            .then(function findUser(record) {
              res.locals.data = record;

              if (record && record.id && req.isAuthenticated && req.isAuthenticated()) {
                // ser role owner
                if (req.user.id == record.id) {
                  if(req.userRoleNames.indexOf('owner') == -1 ) req.userRoleNames.push('owner');
                }
              }
              done();

              return null;
            })
            .catch(done);
          }
        },

        loadPrivacity(record, done) {
          we.db.models.userPrivacity
          .findAll({
            where: { userId: record.id },
            raw: true
          })
          .then( (p)=> {
            record.privacity = p;
            done();
            return null;
          })
          .catch(done);
        },

        incrementPublishedHistoryCount(creatorId) {
          return new Promise((resolve, reject)=> {
            if (!creatorId || !Number(creatorId)) {
              return resolve();
            }

            let sql = `UPDATE users SET publishedHistoryCount = publishedHistoryCount + 1
              WHERE id = ${creatorId}`;

            we.db.defaultConnection.query(sql)
            .then(resolve)
            .catch(reject);
          });
        },
        decrementPublishedHistoryCount(creatorId) {
          return new Promise((resolve, reject)=> {
            if (!creatorId || !Number(creatorId)) {
              return resolve();
            }

            let sql = `UPDATE users SET publishedHistoryCount = publishedHistoryCount - 1
              WHERE id = ${creatorId}`;

            we.db.defaultConnection.query(sql)
            .then(resolve)
            .catch(reject);
          });
        },

        emailSend(userId, emailName) {
          const Model = we.db.models['user-unique-email-log'];

          return Model.findOne({
            where: {
              userId: userId,
              emailName: emailName
            }
          })
          .then( (r)=> {
            if (!r) return Model.build({
              userId: userId,
              emailName: emailName,
              send: false
            });
            return r
          })
        },
        sendNewUserEmail(user) {
          if (
            we.plugins['we-plugin-email'] &&
            user &&
            user.toJSON &&
            user.active &&
            user.id
          ) {
            we.db.models.user.emailSend(user.id, 'newUserEmail')
            .then( (eLog)=> {
              if (eLog.send) return null; // already send
              // only send to new users:
              if (we.utils.moment(user.createdAt).unix < 1540819709) return null;

              const tv = user.toJSON();

              tv.siteName = we.config.appName;
              tv.userEmail = user.email;
              tv.siteUrl = we.config.hostname;
              tv.userName = (user.displayName || user.fullName);
              tv.userEditProfileURL = we.config.hostname+'/user/'+user.id+'/edit'

              if (we.systemSettings) {
                if (we.systemSettings.siteName) {
                  tv.siteName = we.systemSettings.siteName;
                }
              }

              const options = { to: tv.userEmail };
              // send email in async
              we.email.sendEmail('newUserEmail',
                options, tv,
              (err)=> {
                if (err) {
                  we.log.error('user:newUserEmail', err);
                }
              });

              eLog.send = true;
              return eLog.save();
            })
            .catch( (err)=> {
              we.log.error('user:newUserEmail', err);
            });
          }
        },
        sendNewHistoryEmail(user, history) {
          if (
            we.plugins['we-plugin-email'],
            user && user.id &&
            history && history.id && history.title &&
            ( history.published == false )
          ) {
            const emailName = 'newHistoryEmail_'+history.id;

            we.db.models.user.emailSend(user.id, emailName)
            .then( (eLog)=> {
              if (eLog.send) return null; // already send
              // only send to new histories:
              if (we.utils.moment(history.createdAt).unix < 1540819709) return null;

              const tv = user.toJSON();

              tv.siteName = we.config.appName;
              tv.userEmail = user.email;
              tv.siteUrl = we.config.hostname;
              tv.userName = (user.displayName || user.fullName);
              tv.historyTitle = history.title;
              tv.historyCreatedAt = we.utils.moment(
                history.createdAt
              ).format('dd/mm/yyyy');
              tv.historyId = history.id;
              tv.historyUrl = we.config.hostname+'/history/'+history.id;

              if (we.systemSettings) {
                if (we.systemSettings.siteName) {
                  tv.siteName = we.systemSettings.siteName;
                }
              }

              const options = { to: tv.userEmail };
              // send email in async
              we.email.sendEmail('newHistoryEmail',
                options, tv,
              (err)=> {
                if (err) {
                  we.log.error('user:newHistoryEmail', err);
                }
              });

              eLog.send = true;
              return eLog.save();
            })
            .catch( (err)=> {
              we.log.error('user:newHistoryEmail', err);
            });
          }
        },
        sendHistoryPublishedEmail(user, history) {
          if (
            we.plugins['we-plugin-email'],
            user && user.id &&
            history && history.id && history.title &&
            ( history.published == true )
          ) {
            const emailName = 'historyPublishedEmail_'+history.id;

            we.db.models.user.emailSend(user.id, emailName)
            .then( (eLog)=> {
              if (eLog.send) return null; // already send

              const tv = user.toJSON();

              tv.siteName = we.config.appName;
              tv.userEmail = user.email;
              tv.siteUrl = we.config.hostname;
              tv.userName = (user.displayName || user.fullName);
              tv.historyTitle = history.title;

              tv.historyCreatedAt = we.utils.moment(
                history.createdAt
              ).format('DD/MM/YYYY');
              tv.historyPublishedAt = we.utils.moment(
                history.publishedAt
              ).format('DD/MM/YYYY');

              tv.historyId = history.id;
              tv.historyUrl = we.config.hostname+'/history/'+history.id;

              if (we.systemSettings) {
                if (we.systemSettings.siteName) {
                  tv.siteName = we.systemSettings.siteName;
                }
              }

              const options = { to: tv.userEmail };
              // send email in async
              we.email.sendEmail('historyPublishedEmail',
                options, tv,
              (err)=> {
                if (err) {
                  we.log.error('user:historyPublishedEmail', err);
                }
              });

              eLog.send = true;
              return eLog.save();
            })
            .catch( (err)=> {
              we.log.error('user:historyPublishedEmail', err);
            });
          }
        }
      },
      instanceMethods: {
        toJSON() {
          const obj = this.get();

          if (!this.canViewAllUserData) {
            // delete and hide user email
            delete obj.fullName;
            delete obj.email;
            delete obj.cpf;
            delete obj.passaporte;
            // remove password hash from view
            delete obj.password;
          }

          if (!obj.username) obj.username = obj.id;

          return obj;
        }
      },
      hooks: {
        beforeValidate(user) {
          user.username = user.id;

          if (user.isNewRecord) {
            // dont set password on create
            user.dataValues.password = null;
            user.dataValues.passwordId = null;
          }
        },
        // Lifecycle Callbacks
        beforeCreate(user) {
          user.username = user.id;

          // never save consumers on create
          delete user.consumers;
          // dont allow to set admin and moderator flags
          delete user.isAdmin;
          delete user.isModerator;
        },
        afterCreate(user) {
          we.db.models.user.sendNewUserEmail(user);
        },

        beforeUpdate(user) {
          user.username = user.id;

          if (user.avatar && user.avatar.length) {
            user.haveAvatar = true;
          } else {
            user.haveAvatar = false;
          }

          // dont change user acceptTerms in update
          user.acceptTerms = true;
        },
        afterUpdate(user) {
          we.db.models.user.sendNewUserEmail(user);
        },

        afterFind(record) {
          return new Promise( (resolve, reject)=> {
            if (!record) return resolve();

            // load privacity to hide user fields in toJSON
            if (we.utils._.isArray(record)) {
              we.utils.async.eachSeries(record, (r, next)=> {
                we.db.models.user.loadPrivacity(r, next);
              }, (err)=> {
                if (err) return reject(err);
                resolve();
              });
            } else {
              we.db.models.user.loadPrivacity(record, (err)=> {
                if (err) return reject(err);
                resolve();
              });
            }
          });
        }
      }
    }
  };

  return model;
};