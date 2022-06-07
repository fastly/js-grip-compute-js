/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

import { PublisherBase, PublisherClient } from "@fanoutio/grip";
import { IGripConfig } from "./IGripConfig";
import { PublisherTransport } from "./PublisherTransport";
import { parseGripUri } from './util';

export class Publisher extends PublisherBase<IGripConfig> {
  override parseGripUri(uri: string): IGripConfig {
    return parseGripUri(uri);
  }
  buildPublisherClient(config: IGripConfig): PublisherClient {
    const { control_uri: uri, backend } = config;

    const transport = new PublisherTransport(uri, backend);
    return new PublisherClient(transport);
  }
}
