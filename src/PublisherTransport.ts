import { FetchResponse, IPublisherTransport, IReqHeaders } from "@fanoutio/grip";

export class PublisherTransport implements IPublisherTransport {
  publishUri: string;
  backend: string;

  constructor(uri: string, backend: string) {
    // Initialize this class with a URL representing the publishing endpoint.
    if(!uri.endsWith('/')) {
      // To avoid breaking previous implementation, if the URL does
      // not end in a slash then we add one.
      // e.g. if URI is 'https://www.example.com/foo' then the
      // publishing URI is 'https://www.example.com/foo/publish'
      uri += '/';
    }

    const publishUri = new URL('./publish/', uri);
    this.publishUri = String(publishUri);

    this.backend = backend;
  }

  async publish(headers: IReqHeaders, content: string): Promise<FetchResponse> {
    const reqParams = {
      method: 'POST',
      headers,
      body: content,
      backend: this.backend,
    };
    return await fetch(this.publishUri, reqParams);
  }
}
