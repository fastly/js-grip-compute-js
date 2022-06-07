/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

import { IGripConfigBase } from "@fanoutio/grip";

export interface IGripConfig extends IGripConfigBase {
  // Fastly service backend for publishing
  backend: string;
}
