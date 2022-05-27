import { IGripConfigBase, PublisherBase, PublisherClient } from "@fanoutio/grip";
import { IGripConfig } from "./IGripConfig";
import { PublisherTransport } from "./PublisherTransport";

export class Publisher extends PublisherBase<IGripConfig> {
  override additionalParseGripUri(parsed: IGripConfigBase, uri: string): IGripConfig {
    const parsedUri = new URL(uri);
    return {
      ...parsed,
      backend: parsedUri.searchParams.get('backend') ?? '',
    };
  }

  buildPublisherClient(config: IGripConfig): PublisherClient {
    const { control_uri: uri, backend } = config;

    const transport = new PublisherTransport(uri, backend);
    return new PublisherClient(transport);
  }
}
