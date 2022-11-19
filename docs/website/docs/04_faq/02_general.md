# General Questions

## Why not go with folder per feature?

There's no right or wrong, it's a matter of opionion. I felt that feature-per-folder is more of a frontend thing, and decided to stick to Rails' conventions strictly, when it comes to folder structure.

From my experience -- I can still navigate Rails apps easily, even though I didn't touch Rails code for the last 6 years. That means its folder structure really works -- so I kept sticking to it in _Hyperstack_.


## How is authentication implemented?

The guideline was simple: implement as less custom security code as possible, reuse production-grade libraries and workflows. And so, authentication in _Hyperstack_ is just JWT + Bearer auth and nothing more.

I have a strong security background, which is exactly why I know that to have good security, you want to not reinvent the wheel.

## Why Sequelize and not Prisma?

I really like Prisma (I'm a Rust dev, and they have a fantastic Rust core), and in fact I started out with it.

I discovered a few things:

There's no ActiveRecord abstraction, in the sense, that I can't build an entity and let my users add code to it conveniently. So I could never do this:

```js
const user = User.find(..)
user.calculate_shipping_costs()
```

My goal for developer happiness was to support this kind of ergonomics, instead of building a DataMapper like layer, where a user needs to get a data object which requires you to somehow handle context, state, and "just know" where everything is and always deal with wiring it.

```js
const user = User.find(..)
UserLogic.calculate(user, db/transaction,etc.)
```

In addition, I wanted Controller code to be very clean -- don't spread logic partly in controller, partly in models, partly in various logic layers.

For migrations, I could embed the Sequelize frameworks and tailor them to my needs

Relationship modeling -- more mature and more predictable with Sequelize. It just has that much more mileage than Prisma

There were more little bits, but eventually I went back to the old, familiar, stable Sequelize.

Yes, ActiveRecord has issues -- but there are MANY more issues going DataMapper or brewing your own. And in fact ActiveRecord is great up until the point you have a gigantic software project, and if you have a gigantic software project -- congratz my friend -- you made it! you probably have enough resources and engineers to think up what's the best way to split your code.

## Testing backend with Snapshots? why?

For snapshot testing, actually, this is a place where the experience is _improved_ over Rails. I know my approach is surprising, but all developers that worked with my approach to "snapshot testing the backend" could never go back. It's a massive productivity gain, especially when you're doing a lot of "left-right-testing" of entities and responses.

Actually, some of that *was* baked into Rails, but it was part of the community -- VCR was used many times for recorded tests in requests only. I took it to all over the different parts of the app.


For truncating etc. I actually give you the option through configuration. You can decide if you want to:

- destroy tables and sync
- destroy and migrate
- truncate

This was a small layer I added, to solve all the "database_cleaner" and all of the wiring ceremonies I always did in Rails.
