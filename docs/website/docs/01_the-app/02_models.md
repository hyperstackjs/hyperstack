# Models

Models in _Hyperstack_ mean entity classes that allow for easy database querying and writes, but also migrations and seeding.


## Fat models, slim controllers

_Hyperstack_ models **are designed after active record**. This means they're a central point in your universe, and every logic or operation your app has should be there.

It means that `User.create` creates a user **but also** `user.buy(product)` will buy a product.

If you agree with that direction you'll get these for free:

* **Time-effective testing**, because testing your model tests most if not all of your logic and moving parts.
* Ability to run complete app workflows **from _tasks_, or from the _Hyperstack_ portal**.
* Effectively **compose features** and use cases by combining models, and nothing else.
* Essentially, **models become your app** and controllers are just one way to expose your app to the world.

## Example model

```ts
import { HyperModel, Schema } from 'hyperstack'
const { AllowNull, Column, DataType, Table } = Schema

@Table
class Article extends HyperModel<Partial<Article>> {
  @Column
  title: string

  @Column(DataType.TEXT)
  content: string

  @Column
  deleted: boolean

  toJSON() {
    const { title, content, deleted } = this.get() as any
    return {
      title,
      content,
      deleted,
    }
  }
}
export { Article }
```

A model uses Sequelize data types re-imported from `hypermodel`, which is the _Hyperstack_ abstraction for active record.

You don't have to create a model by hand. It's better to generate one:

```
$ bin/hyperstack g model article title:string content:text deleted:bool
```

## Migrations

After you've generated a model, you get a migration that takes care of both `up` and `down` for your database schema.

Migrations exist in `config/db/migrate` and you run them like so:

```
$ bin/hyperstack migrate
```

For generating a new migration file for modifying an existing model you can run:
```
bin/hyperstack g migration migration_name
```
This will create a new empty migration file for you to fill in the changes to your models.

## Configuration

Model configuration that's available to you is exciting because it controls all aspects of development, testing, and production, with a ton of goodies, coming from production experience.


```ts
database: {
  // accepts also: sqlite://[path to file]
  uri: 'postgres://localhost:5432/tie_development',
  // set to true in production!
  ssl: false,
  // true for better performance
  native: true,
  // if true, drops schema when the app starts. great for testing or debugging in development
  // combine with synchronize: true
  dropSchema: false,
  // bring up schema up to date, without migrations
  synchronize: true,
  // delete all contents from all tables (but don't drop them). good for test mode.
  truncate: false,
  // automatically migrate when app starts. only migrates if needed.
  // even if this is false, you can still manually migrate with: bin/hyperstack migrate
  migrate: false,
  // shows what is sent out to your database. great for debugging queries live.
  logging: console.log,
},
```

By combining these flags, you can great different expriences to help you be more productive.

For example, we set `truncate: true`, `synchronize: true` in test mode, when test are running. This will create a fresh database set up for **every test** and help isolate data.

In production, you want everything turned off.

## Testing

Testing models in _Panam_ is **super simple**. Remember, this is where you test all of your actual logic.


```ts title="test/models/article.spec.ts"
import { test } from '@hyperstackjs/testing'
import { root } from '../../config/settings'
import { appContext } from '../../app'

const { models } = test(root)

describe('models', () => {
  describe('article', () => {
    models('should create with owner', async (_app) => {
      const { Article } = appContext.models()
      const article = await Article.create({
        title: 'string',
        content: 'some text',
        deleted: true,
      })
      expect(article.toJSON()).toMatchSnapshot()
    })
  })
})
```

In order to load a model into a test file, you should use `appContext` (the same way as `Article` model is being loaded in the example above) instead importing its module directly. In this way you are making sure that your model has passed through the initialization phase on application startup.

Use snapshots freely, and the rest is taken care of for you by _Hyperstack_ (setting up database, cleaning up, etc.).

