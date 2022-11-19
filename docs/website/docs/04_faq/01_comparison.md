# Comparison

## Why is this a better "MVC framework" for Node.js than other alternatives?

Well, "better" is a matter of taste. In _Hyperstack_, first there are a few things I choose not to do. I know it sounds like Yoda, but choosing not to do things is sometimes harder than choosing to do.

**Hyperstack has no Views**, as opposed to frameworks like Adonis. I believe today people choose their own fully JS based apps, so Hyperstack has nothing to offer here. 

If you want server-side rendered HTML, **I'd go for Rails**, if you want to build React / Vue apps -- then all you need is a Javascript based server where you can actually share a lot of tools and knowledge. So Hyperstack is MVC, where the V is just JSON serialization. This makes it much less complex.


**Hyperstack is hackable**, if you get stuck, the code will not bite you. Most of it is just sugar wrapping great Node.js libraries that you're already familiar with like _Sequelize_, _bullmq_, and other components. _Hyperstack_ will be much more hackable, you could customize it, change its code easily without intimate knowledge of the framework.

**Build your side projects into a start up**, _Hyperstack_ includes everything you need to build an app that delivers value. You can run it on a very small server, or a large one and it doesn't require any cloud API as a must. You have models, but also a way to run ad-hoc tasks to maintain your business. Hyperstack is what you'd get if you paid for a permium Rails SaaS template, or have someone build it for you off-shore.


## Compared to Nestjs?

With Hyperstack you get everything in a box and you can disable parts you don't need, with Nestjs you need to add the parts you like and configure and wire stuff up.

This means that with Hyperstack you get a much smoother experience and productivity where you're looking to build a *complete* project for something like a startup or a new idea.

You get mailers, background jobs, interactive REPL to play with your data, code generators, ad-hoc tasks for production maintenance, and more -- all playing with the same building blocks almost the same way as in Ruby on Rails.

Choose Hyperstack **when you're building a full product**, perfect for solo developers, small teams, entrepreneurs.

Choose Nestjs **where you have a large team and you need to pick and configure many parts** suiting different people and different teams.

## Compared to Adonis?

Adonis vs Hyperstack: at the time, I really wanted Adonis to work for me, but it was going through a rewrite, and I didn't like Lucid (it's from-scratch ORM). I preferred Sequelize as it was more stable and more popular (I know Lucid is built on knex, but still). 

Also, I needed the same workflow in background jobs: mailers, workers, which don't exist. Hyperstack does not have a view layer, because it assumes a Javascript frontend such as React / Vue / etc.

**Hyperstack is a stack, while Adonis is a framework**. It means that with _Hyperstack_ you will be using things you are already familiar with: _Sequelize_, _bullmq_, and other components. _Hyperstack_ will be much more hackable, you could customize it, change its code easily without intimate knowledge of the framework.

