# Portal

You can open a portal to your app in this way:


```
drive portal
```

Then, you can use a few predefined functions:

* `to(model|models)` "tableize object" to print objects that you might serialize to end users as a table. Example: `> to(await User.findAll())`
* `tr(model|models)` "tableize raw value" to print entities from DB, including fields that won't get sent to end users. Example: `> tr(await User.findAll())`


And their counterparts, which returns the objects themselfs for the Node console to print: `oo` ("get object as an object") and `ro` ("get raw value as an object").

## Jobs


Run:

```
$ bin/hyperstack portal
```

And say `.jobs`:

```
⚡[development] > .jobs
name        queue       active  completed  delayed  failed  paused  waiting  waiting-children
---------------------------------------------------------------------------------------------
Calculator  calculator  0       0          0        0       0       0        0
Downloader  downloads   0       0          0        5       0       0        0
```
