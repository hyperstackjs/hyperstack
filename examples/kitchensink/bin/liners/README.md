# Liners

This folder contains one-liner self executing scripts that demonstrates how to directly run what you want with our infrastructure, which will be useful when you want to brew your own start up procedure.



For example to run just a worker with no arguments, parameters and so on, you can:

```
$ bin/liners/worker
```

**Instead** of running

```
$ bin/hyperstack start --worker
```

And if you have some special set up to do when running workers, this is the script you can fiddle with.
