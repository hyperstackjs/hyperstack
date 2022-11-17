# Logger


> WIP: this doc is still in writing

## Redaction & Filtering

You can redact, filter, or censor using the `redact` configuration block.

```ts
  logger: {
    redact: {
      paths: ['res.headers["content-security-policy"]'],
      remove: true,
    },
  },
```

Use it to remove noise, sensitive data, or GDPR oriented data, as well as mark it clearly on the log if needed for auditing.

See redaction in more detail [here](
https://github.com/pinojs/pino/blob/master/docs/redaction.md)

_Hyperstack_ already contains **a predefined set of redaction keys**, that will get merged with your specific redaction requirements.

## Logs in Production

_Hyperstack_ will output **JSON logs in production**, which makes it easy for any log indexing and searching service to injest.

In addition, you can set a `DEBUG=*` environment flag, to activate all of the internal library trace logs in Node.js.


**To search through logs**, in _Heroku_, you can do of the following:

* Use `heroku logs -t` to tail and look through the logs as they come
* In the Heroku dashboard, you can click [_View Logs_](https://devcenter.heroku.com/articles/logging#view-logs-with-the-heroku-dashboard)
* Or, you can add a free plugin for log search, such as Coralogix. These plugins automatically connect with your log stream, so you have nothing to do on your end.


