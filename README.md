# js-grip-compute-js

A GRIP interface library for JavaScript on Compute@Edge.

This is an adapter for using [`@fanoutio/grip`](https://github.com/fanout/js-grip) on
Compute@Edge with JavaScript.

## Usage

The following example posts to a Fastly Fanout publisher represented by a `GRIP_URL`.
Make sure you have set up a backend on your service named `grip-publisher` that can access the host name `fanout.fastly.com`.

```javascript
import { Publisher } from "@fastly/grip-compute-js";
import { GripInstruct } from "@fanoutio/grip";

const publisher = new Publisher(`https://fanout.fastly.com/<service-id>?iss=<service-id>&key=<api_token>&backend=grip-publisher`);

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
async function handleRequest(event) {
  const url = new URL(event.request.url);
  if(url.pathname === '/api/stream') {
    const instruct = new GripInstruct('test');
    instruct.setHoldStream();
    const headers = instruct.toHeaders();
    return new Response('[open stream]\n', {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/plain',
      },
    });
  }
  if(url.pathname === '/api/publish') {
    const msg = url.searchParams.get('msg') ?? 'test message';
    try {
      await publisher.publishHttpStream('test', msg + '\n');
      return new Response(
        'Publish successful!', 
        {status: 200, headers: {'Content-Type': 'text/plain'}}
      );
    } catch({message, context}) {
      return new Response(
        'Publish failed!\n' + message + '\n' + JSON.stringify(context, null, 2) + '\n',
        {status: 500, headers: {'Content-Type': 'text/plain'}
      });
    }
  }
  return new Response('Not found.\n', {status: 404, headers: {'Content-Type': 'text/plain'}});
}
```

## WS-over-HTTP

The following examples uses WS-over-HTTP.

```javascript
import { Publisher } from "@fastly/grip-compute-js";
import { GripInstruct, WebSocketMessageFormat } from "@fanoutio/grip";

const publisher = new Publisher(`https://fanout.fastly.com/<service-id>?iss=<service-id>&key=<api_token>&backend=grip-publisher`);

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));
async function handleRequest(event) {
  const url = new URL(event.request.url);
  if(url.pathname === '/api/websocket') {
    // if necessary, validate this header using validateSig()
    const gripSigHeader = event.request.headers.get('grip-sig');
    if(gripSigHeader == null) {
      return new Response('Not proxied\n', { status: 401, headers: { 'Content-Type': 'text/plain', }, });
    }
    // Make sure we have a connection ID
    let cid = event.request.headers.get('connection-id');
    if (cid == null) {
      return new Response('connection-id required\n', { status: 401, headers: { 'Content-Type': 'text/plain', }, });
      return;
    }
    const inEventsEncoded = await event.request.text();
    const inEvents = decodeWebSocketEvents(inEventsEncoded);
    const wsContext = new WebSocketContext(cid, {}, inEvents);
    let responseString = '';
    if (wsContext.isOpening()) {
      // Open the WebSocket and subscribe it to a channel:
      wsContext.accept();
      wsContext.subscribe('test-ws');
      // The above commands made to the wsContext are buffered in the wsContext as "outgoing events".
      // Obtain them and write them to the response.
      const outEvents = wsContext.getOutgoingEvents();
      responseString += encodeWebSocketEvents(outEvents);
    }
    // Set the headers required by the GRIP proxy:
    const headers = wsContext.toHeaders();
    return new Response(responseString, {status: 200, headers,});
  }
  if(url.pathname === '/api/broadcast') {
    try {
      const msg = await event.request.text();
      await publisher.publishFormats('test-ws', new WebSocketMessageFormat(msg));
      return new Response('Ok\n', {status: 200, headers: {'Content-Type': 'text/plain'}});
    } catch({message, context}) {
      return new Response(
        'Publish failed!\n' + message + '\n' + JSON.stringify(context, null, 2) + '\n',
        {status: 500, headers: {'Content-Type': 'text/plain'}
      });
    }
  }
  return new Response('Not found.\n', {status: 404, headers: {'Content-Type': 'text/plain'}});
}
```

## Running Locally

For local development, you can run this locally using `fastly compute serve`.

In order to do this, you will need to run the open-source [Pushpin](https://pushpin.org) server to take
the place of Fastly and the Publisher.

Use a constructor call such as the following:

```javascript
const serveGrip = new Publisher({
  control_uri: 'http://localhost:5561/',
  backend: 'grip-publisher',
});
```

And make sure that your `fastly.toml` file defines a backend named `grip-publisher` for `http://localhost:5561/`.

Additionally, if you need the WebSocket-over-HTTP functionality, make sure Pushpin uses the `over_http` setting.

## Issues

If you encounter any non-security-related bug or unexpected behavior, please [file an issue][bug]
using the bug report template.

[bug]: https://github.com/fastly/js-grip-compute-js/issues/new?labels=bug

### Security issues

Please see our [SECURITY.md](./SECURITY.md) for guidance on reporting security-related issues.

## License

[MIT](./LICENSE.md).
