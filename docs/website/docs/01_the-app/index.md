# The App

A _Hyperstack_ app should always look the same, covering:

* Models - Fat models, slim controllers.
* Controllers - Strictly JSON serving APIs
* Workers - Real background jobs using Redis
* Mailers - Sending emails is a thing, and Slack/IM didn't really "solve" emails. Great user experience has to have great emails.
* Tasks - Avoiding building a custom admin app is great. As long as you have Tasks, you don't have to build an admin.

And lastly, real-world configuration and environments are central to great productivity.
