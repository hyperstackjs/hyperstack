// regarding transactional DDL, not all dialects support it,
// so use it as you may.
// see https://github.com/sequelize/sequelize/issues/7902

module.exports = {
  up: async ({ query, t }) => {
    await query.createTable(
      'Notes',
      t.build(
        t.intPK('id'),
        t.uniqueString('pid'),
        t.nonNullString('title'),
        t.string('content'),
        t.intFK('ownerId', 'Users', 'id'),
        t.timestamps()
      )
    )
  },
  down: async ({ query }) => {
    await query.dropTable('Notes')
  },
}
