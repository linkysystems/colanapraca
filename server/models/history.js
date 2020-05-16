/**
 * History model
 */

const squel = require('squel');

const vName = {
  tags: 'Tags',
  category: 'Category'
};

module.exports = function HModel(we) {
  const model = {
    definition: {
      highlighted: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        formFieldType: null
      },
      showInLists: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: true,
        formFieldType: null
      },
      allowComments: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: true,
        formFieldType: null
      },
      title: {
        type: we.db.Sequelize.STRING,
        allowNull: false,
        skipSanitizer: true
      },
      body: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        formFieldType: 'html',
        formFieldHeight: 400
      },
      historyDate: {
        type: we.db.Sequelize.DATE,
        allowNull: true
      },
      published: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      publishedAt: {
        type: we.db.Sequelize.DATE,
        allowNull: true
      },
      uploadedVideoID: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      youtubeVideoUrl: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        formFieldType: 'string'
      },
      publishAsAnonymous: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false
      },
      isImported: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      haveText: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: true,
        formFieldType: null
      },
      haveImage: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      haveVideo: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      haveAudio: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      haveAnyMedia: {
        type: we.db.Sequelize.VIRTUAL,
        get() {
          if (
            this.get('haveText') ||
            this.get('haveImage') ||
            this.get('haveVideo') ||
            this.get('haveAudio')
          ) {
            return true;
          }
          return false;
        }
      },
      country: {
        type: we.db.Sequelize.STRING(5),
        formFieldType: 'location/country',
        defaultValue: 'BR'
      },
      locationState: {
        type: we.db.Sequelize.STRING(10),
        formFieldType: 'location/state',
        formCountryFieldName: 'country'
      },
      city: {
        type: we.db.Sequelize.STRING,
        formFieldType: 'location/city',
        formStateFieldName: 'locationState'
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
      categoryItem: {
        type: we.db.Sequelize.VIRTUAL,
        get() {
          const category = this.get('category');
          if (category && category.length) {
            return category[0];
          }

          return null;
        }
      },
      setAlias: {
        type: we.db.Sequelize.VIRTUAL
      }
    },
    associations: {
      creator: {
        type: 'belongsTo',
        model: 'user'
      }
    },
    options: {
      // title field, for default title record pages
      titleField: 'title',
      tableName: 'histories',

      termFields: {
        tags: {
          vocabularyName: null,
          canCreate: true,
          formFieldMultiple: true,
          onlyLowercase: true
        },
        category: {
          vocabularyName: 'Category',
          canCreate: false,
          formFieldMultiple: true
        }
      },

      imageFields: {
        featuredImage: { formFieldMultiple: false },
        images: { formFieldMultiple: true }
      },

      videoFields: {
        videos: { formFieldMultiple: true }
      },

      urlFields: {
        videoUrls: { formFieldMultiple: true },
        audioUrls: { formFieldMultiple: true }
      },

      audioFields: {
        audios: { formFieldMultiple: true }
      },

      fileFields: {
        attachment: { formFieldMultiple: true }
      },
      classMethods: {
        urlAlias(record) {
          const part2 = we.utils.slugifyAndTruncate (
            record.title, 40, ''
          );

          return {
            alias: '/historias/' + record.id + '-' + part2,
            target: '/history/' + record.id,
          };
        },
        publish(record, status) {
          return new Promise( (resolve, reject)=> {
            record.updateAttributes({
              published: status,
              publishedAt: Date.now()
            })
            .then( (r)=> {
              if (r.creator && r.creatorId) {
                return r;
              }

              return r.getCreator()
              .then( (creator)=> {
                r.creator = creator;
                return r;
              });
            })
            .then( ()=> {
              if (status) {
                // published
                we.hooks.trigger('history:published:after', {
                  we: we,
                  history: record
                }, (err)=> {
                  if (err) we.log.error('history:publish:error', err);
                  resolve(record);
                });
              } else {
                resolve(record);
              }

              return null;
            })
            .catch(reject);
          });
        },

        loadSearchTerms() {
          return we.db.models.term.findAll({
            where: {
              vocabularyName: [
                'tags',
                'category'
              ]
            },
            raw: true,
            attributes: ['text', 'vocabularyName'],
            order: [['text', 'ASC']]
          })
          .then( (terms)=> {
            let data = {};
            // sort
            terms.forEach( (term)=> {
              let key = vName[term.vocabularyName];

              if (!data[key]) {
                data[key] = [];
              }

              data[key].push( term.text );
            });

            return data;
          });
        },

        buildSearchQuery(req) {
          const q = req.query;

          let s = squel.select()
          s.field('h.id');
          s.from('histories', 'h')

          if (!req.we.acl.canStatic('access_history_unpublished', req.userRoleNames)) {
            // not is admin and cant access unpublished:
            if (req.isAuthenticated()) {
              s.where (
                squel.expr()
                .and('h.creatorId = '+req.user.id)
                .or(
                  squel.expr()
                  .and('h.creatorId != '+req.user.id)
                  .and('h.published = 1')
                )
              );
            } else {
              s.where ('h.published = 1');
            }
          } else {
            // published filter if user has access:
            if (
              req.query.published === true ||
              req.query.published == 'true'
            ) {
              s.where ('h.published = 1');
            } else if (
              req.query.published == 'false' ||
              req.query.published == false
            ) {
              s.where ('h.published = 0 OR h.published IS NULL');
            }
          }

          if (q.q) {
            s.where(
              squel.expr()
              .or('h.title LIKE ?', '%'+q.q+'%')
              .or('h.body LIKE ?', '%'+q.q+'%')
            );
          }

          if (q.id) s.where('h.id = ?', q.id);
          if (q.title_contains) s.where('h.title LIKE ?', '%'+q.title_contains+'%');
          if (q.locationState_contains) s.where('h.locationState LIKE ?', '%'+q.locationState_contains+'%');

          if (q.haveImage) s.where('h.haveImage = 1');
          if (q.haveText) s.where('h.haveText = 1');
          if (q.haveVideo) s.where('h.haveVideo = 1');
          if (q.haveAudio) s.where('h.haveAudio = 1');

          // location:
          if (q.country) s.where('h.country = ?', q.country);
          if (q.locationState) s.where('h.locationState = ?', q.locationState);
          if (q.city) s.where('h.city = ?', q.city);

          // term fields:
          const termFields = we.db.modelsConfigs.history.options.termFields;
          for(let field in termFields) {
            if (q[field]) {
              s.join('modelsterms', field,
                squel.expr()
                .and(field+'.modelId = h.id')
                .and(field+'.modelName = "history"')
                .and(field+'.field = ?', field)
              );
              s.join('terms', field+'_t',
                squel.expr()
                .and(field+'_t'+'.id = '+field+'.termId')
                .and(field+'_t'+'.text = ?', q[field])
              );
            }
          }

          // creator:
          if (q.creatorName_like) {
            s.join('users', 'c',
              squel.expr()
              .and('c.id = h.creatorId')
              .and(
                squel.expr()
                .or('c.displayName LIKE ?', '%'+q.creatorName_like+'%')
                .or('c.fullName LIKE ?', '%'+q.creatorName_like+'%')
              )
            );
          }

          s.order('h.id', false);

          s.limit(15)

          if (Number(req.query.page) || Number(req.query.page) > 1) {
            s.offset(( req.query.page*15 )-15);
          }

          s.distinct();

          // console.log('>>', s.toString());

          return s;
        }
      },
      // record method for use with record.[method]
      instanceMethods: {
        setMidiaFlags() {
          const r = this;
          // have text
          if (r.body && r.body.trim && r.body.trim()) {
            r.haveText = true;
          } else {
            r.haveText = false
          }
          // have image
          if (
            (r.featuredImage && r.featuredImage.length) ||
            (r.images && r.images.length)
          ) {
            r.haveImage = true;
          } else {
            r.haveImage = false
          }
          // video
          if (
            (r.videoUrls && r.videoUrls.length) ||
            (r.videos && r.videos.length)
          ) {
            r.haveVideo = true;
          } else {
            r.haveVideo = false
          }
          // audio
          if (
            (r.audioUrls && r.audioUrls.length) ||
            (r.audios && r.audios.length)
          ) {
            r.haveAudio = true;
          } else {
            r.haveAudio = false
          }
        },

        publish(status) {
          return we.db.models.history.publish(this, status);
        }
      },
      hooks: {
        beforeCreate(r) {
          // create an published history and set its publishedDate:
          if (r.published) {
            r.publishedAt = Date.now();
          }

          if (!r.historyDate) {
            r.historyDate = r.createdAt;
          }

          if (!r.highlighted) {
            r.highlighted = 0;
          }

          r.setMidiaFlags();
        },

        beforeUpdate(r) {
          if (r.published && !r.publishedAt) {
            // set publishedAt on publish:
            r.publishedAt = Date.now();
          } else if (!r.published && r.publishedAt) {
            // reset publishedAt on unpublish
            r.publishedAt = null;
          }

          if (!r.historyDate) r.historyDate = r.createdAt;
          if (!r.highlighted) r.highlighted = 0;

          r.setMidiaFlags();
        },

        afterUpdate(r) {
          if (r.changed('published')) {
            if (!r.creatorId || !r.creator) {
              return r;
            }

            let creatorId = r.creatorId || r.creator.id;

            if (r.published) {
              we.db.models.user.incrementPublishedHistoryCount(creatorId)
              .then( ()=> {
                return r;
              });
            } else {
              we.db.models.user.decrementPublishedHistoryCount(creatorId)
              .then( ()=> {
                return r;
              });
            }
          }

          return r;
        }
      }
    }
  };

  return model;
};
