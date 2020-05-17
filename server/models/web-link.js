/**
 * link model
 */
const categories = require('../../lib/categories');

module.exports = function Model(we) {
  const model = {
    definition: {
      url: {
        type: we.db.Sequelize.STRING(2000),
        size: 2000,
        allowNull: false
      },
      title: {
        type: we.db.Sequelize.STRING(1500),
        size: 1500,
        allowNull: false
      },
      description: {
        type: we.db.Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: we.db.Sequelize.STRING,
        formFieldType: 'select' ,
        fieldOptions: categories
      },
      published: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },
      publishedAt: {
        type: we.db.Sequelize.DATE,
        allowNull: true,
        formFieldType: null
      }
    },
    associations: {
      creator: {
        type: 'belongsTo',
        model: 'user'
      }
    },
    options: {
      tableName: 'web_links',
      classMethods: {},
      instanceMethods: {},
      hooks: {}
    }
  };

  return model;
};
