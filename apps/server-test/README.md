# server-test

A throwaway Chatpack backend for the example app: `@chatpack/core` + the
in-memory adapter + the typing/presence/receipts plugins, on port 3000.

```sh
npm start -w server-test
```

**Demo only:** it trusts an `x-user-id` header as the signed-in user. Real
apps verify a session in the `auth` hook.
