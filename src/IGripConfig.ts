import { IGripConfigBase } from "@fanoutio/grip";

export interface IGripConfig extends IGripConfigBase {
  // Fastly service backend for publishing
  backend: string;
}
