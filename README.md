# js-grip-compute-js

A GRIP interface library for JavaScript on Compute@Edge.

## Usage

The following example posts to a Pushpin publisher at `http://localhost:5561/publish/`.
Make sure you have set up a Backend on your service that can be accessed through that host name.

```javascript
import { Publisher } from "@fastly/grip-compute-js";
import { GripInstruct } from "@fanoutio/grip";

const publisher = new Publisher({
  control_uri: 'http://localhost:5561/',
  backend: 'grip-publisher',
});

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

The following examples uses WS-over-HTTP. Make sure Pushpin uses the `over_http` settting.

```javascript
import { Publisher } from "@fastly/grip-compute-js";
import { GripInstruct, WebSocketMessageFormat } from "@fanoutio/grip";

const publisher = new Publisher({
  control_uri: 'http://localhost:5561/',
  backend: 'grip-publisher',
});

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
