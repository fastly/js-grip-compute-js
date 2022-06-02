import { IGripConfigBase, parseGripUriCustomParams } from "@fanoutio/grip";
import { IGripConfig } from "./IGripConfig";

export function parseGripUri(uri: string) {
  return parseGripUriCustomParams<IGripConfig, {backend: string}>(
    uri,
    (params: Record<string, string>) => {
      const backend = params['backend'] ?? '';
      delete params['backend'];
      return { backend };
    },
    (configBase: IGripConfigBase, ctx: {backend: string}) => {
      return {
        ...configBase,
        'backend': ctx.backend,
      };
    }
  );
}
