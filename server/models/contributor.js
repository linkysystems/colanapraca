module.exports = function(we) {
  const model = {
    definition: {
      name: {
        type: we.db.Sequelize.STRING,
        allowNull: false,
        size: 1000
      }
    },
    associations: {},
    options: {
      enableAlias: false,
      classMethods: {},
      instanceMethods: {},
      hooks: {}
    }
  };

  return model;
};