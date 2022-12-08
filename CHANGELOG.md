# Changelog


# vNext

* Custom token bearer configuration / JWT token @screencomuser [PR](https://github.com/hyperstackjs/hyperstack/pull/2)

You can now include, in your `environment/config` for `controllers`:

```ts
  controllers: {
    //...
    bearer: {
      header: 'x-access-token',
      query: 'access_token',
    },
  },
```

In which case, the `x-access-token` header will be used. This is now default for apps built with `create-app`, and you can customize it.

