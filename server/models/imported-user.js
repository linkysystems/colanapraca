module.exports = function(we) {
  const model = {
    definition: {
      eid: {
        type: we.db.Sequelize.STRING,
        allowNull: false,
        formFieldType: null,
      },
      userId: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      oldPassword: {
        type: we.db.Sequelize.TEXT
      },
      status: {
        type: we.db.Sequelize.STRING,
        // toImport, imported, errored
        defaultValue: 'toImport',
        allowNull: false
      }
    },
    associations: {},
    options: {
      tableName: 'imported_users',
      enableAlias: false,

      classMethods: {
      },
      instanceMethods: {
      },
      hooks: {}
    }
  };

  return model;
};