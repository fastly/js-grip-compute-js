# @fastly/grip-compute-js

## IMPORTANT: This package is no longer needed. Please read below.

Publishing messages through `@fanoutio/grip` uses the [global `fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)
function as the underlying mechanism. When using `fetch()` in Fastly Compute, it requires the specification of the `backend` parameter.

The main purpose of this library was to define that `backend` value as a query parameter added to the `GRIP_URL` and
to provide specialized versions of `parseGripUri` and `Publisher` that can work with this parameter.

In [@fanoutio/grip version 4](https://www.npmjs.com/package/@fanoutio/grip), the `Publisher` class constructor accepts
an optional second parameter that is used to customize its behavior when performing this `fetch()`.

The example below assigns the backend called `'publisher'` before calling the global fetch.
```javascript
import { Publisher } from '@fanoutio/grip';
const publisher = new Publisher(gripConfig, {
    fetch(input, init) {
        return fetch(String(input), { ...init, backend: 'publisher' });
    },
});
```

If you wish to configure the value by adding it to `GRIP_URL`, the following setup can be used:
```javascript
import { Publisher } from '@fanoutio/grip';

const GRIP_URL = 'https://pushpin.myproject.com/?iss=app&key=secret&backend=publisher'; 

const publisher = new Publisher(GRIP_URL, {
    fetch(input, init) {
        const url = new URL(input);
        const backend = url.searchParams.get('backend');
        url.searchParams.delete('backend');
        return fetch(url.toString(), { ...init, backend });
    },
});
```

## Issues

If you encounter any non-security-related bug or unexpected behavior, please [file an issue][bug]
using the bug report template.

[bug]: https://github.com/fastly/js-grip-compute-js/issues/new?labels=bug

### Security issues

Please see our [SECURITY.md](./SECURITY.md) for guidance on reporting security-related issues.

## License

[MIT](./LICENSE.md).
