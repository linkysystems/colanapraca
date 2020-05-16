
module.exports = function userUniqueEmailLogModel(we) {
  const model = {
    definition: {
      userId: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false
      },
      emailName: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      send: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    options: {
      tableName: 'user_unique_email_log',
      comments: 'Table to register unique e-mail dispatch'
    }
  };

  return model;
};