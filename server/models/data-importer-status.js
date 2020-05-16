/**
 * Data importer status
 */

module.exports = function dataImporterStatusModel(we) {
  const model = {
    definition: {
      status: {
        type: we.db.Sequelize.STRING,
        size: 50,
        defaultValue: 'fetched', // fetched, imported, needupdate
        allowNull: false
      },
      originUrl: {
        type: we.db.Sequelize.TEXT,
        allowNull: false,
        skipSanitizer: true
      },
      domainUrl: {
        type: we.db.Sequelize.TEXT,
        allowNull: false,
        skipSanitizer: true
      },
      href: {
        type: we.db.Sequelize.TEXT,
        allowNull: false,
        skipSanitizer: true
      },
      url: {
        type: we.db.Sequelize.TEXT,
        allowNull: false,
        skipSanitizer: true
      },
      subject: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      org: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      date: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      time: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      source: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      error: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      }
    },
    // Associations
    // see http://docs.sequelizejs.com/en/latest/docs/associations
    associations: {
      content: {
        type: 'belongsTo',
        model: 'content'
      },
      // cats: {
      //   type: 'belongsToMany',
      //   // as: 'Tasks',
      //   through: {
      //     model: 'modelsterms',
      //     unique: false,
      //     constraints: false,
      //     scope: {
      //       modelName: 'content'
      //     }
      //   },
      //   constraints: false,
      //   foreignKey: 'modelId',
      //   // otherKey: 'termId',
      //   //type: 'hasMay',
      //   model: 'term'
      // }
    },
    options: {
      tableName: 'data_importer_status',

      enableAlias: false,

      // title field, for default title record pages
      titleField: 'id',

      // Class methods for use with: we.db.models.[yourmodel].[method]
      classMethods: {
        // suport to we.js url alias feature
        urlAlias(record) {
          return {
            alias: '/data-importer-status/' + record.id,
            target: '/data-importer-status/' + record.id,
          };
        }
      }
    }
  };

  return model;
};
