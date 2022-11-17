export default async () => ({
  database: {
    uri: 'sqlite::memory:',
    ssl: false,
    native: false,
    dropSchema: true,
    synchronize: true, // this is important for the models
    truncate: false,
    migrate: true, // this is important for e2e testing. there's a migration with no model
    logging: false,
  },
})
