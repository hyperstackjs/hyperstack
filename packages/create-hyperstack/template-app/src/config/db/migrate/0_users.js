// regarding transactional DDL, not all dialects support it,
// so use it as you may.
// see https://github.com/sequelize/sequelize/issues/7902

module.exports = {
  up: async ({ query, t }) => {
    await query.createTable(
      'Users',
      t.build(
        t.intPK('id'),
        t.uniqueString('pid'),
        t.uniqueString('username'),
        t.nonNullString('password'),
        t.nonNullString('name'),
        t.string('emailVerificationToken'),
        t.date('emailVerificationSentAt'),
        t.date('emailVerifiedAt'),
        t.string('resetToken'),
        t.date('resetSentAt'),
        t.timestamps()
      )
    )
  },
  down: async ({ query }) => {
    await query.dropTable('Users')
  },
}
