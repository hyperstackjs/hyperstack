# Initializers

Initializers are a way for you to extend your app. **You get access to the boot process of a _Hyperstack_ app**, and are able to swap out or configure parts of it.

> _This doc is still in writing process._

## beforeApp

To do some initialization, verifications, async intialization before the app starts. There is no app or app context yet, so mainly validation, initialization, or notification tasks.

## afterApp

Last chance to swap pieces before app starts. For example email transports.

## afterLogger

A chance to replace or modify logging facilities

## beforeWorkers

A chance to customize workers and mailers before they start consuming jobs. This is a great place to change mailer transport to a custom one, assuming mailer configuration isn't good enough for you.


## beforeMiddleware, afterMiddleware

Add middleware before and after our addition of middlewares. Think of it as top of middleware stack and bottom of middleware stack.

## beforeControllers, afterControllers

Add middleware before our addition of controller routes and after the addition. Think of it as adding middleware just after our own request infra middleware (json parsing, etc.), and just before our response inrfa middleware (error catching etc.)
