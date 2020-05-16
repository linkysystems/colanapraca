module.exports = function(we) {
  const model = {
    definition: {
      eid: {
        type: we.db.Sequelize.STRING,
        allowNull: false,
        formFieldType: null,
      },
      historyId: {
        type: we.db.Sequelize.STRING,
        allowNull: false
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
      tableName: 'imported_histories',
      enableAlias: false,
      classMethods: {},
      instanceMethods: {},
      hooks: {}
    }
  };

  return model;
};