import { parseGripUriCustomParams } from "@fanoutio/grip";
import { IGripConfig } from "./IGripConfig";

type CustomParamsContext = {
  backend: string;
};

export function parseGripUri(uri: string) {
  return parseGripUriCustomParams<IGripConfig, CustomParamsContext>(
    uri,
    (params) => {
      const backend = params['backend'] ?? '';
      delete params['backend'];
      return { backend };
    },
    (configBase, ctx) => {
      return {
        ...configBase,
        'backend': ctx.backend,
      };
    }
  );
}
