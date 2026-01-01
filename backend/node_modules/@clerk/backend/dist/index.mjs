import {
  createAuthenticateRequest,
  createBackendApiClient,
  verifyToken
} from "./chunk-TTM76E4X.mjs";
import "./chunk-YBVFDYDR.mjs";
import {
  withLegacyReturn
} from "./chunk-P263NW7Z.mjs";
import "./chunk-7X3P2E3X.mjs";
import "./chunk-TCIXZLLW.mjs";
import "./chunk-RPS7XK5K.mjs";

// src/index.ts
import { TelemetryCollector } from "@clerk/shared/telemetry";
var verifyToken2 = withLegacyReturn(verifyToken);
function createClerkClient(options) {
  const opts = { ...options };
  const apiClient = createBackendApiClient(opts);
  const requestState = createAuthenticateRequest({ options: opts, apiClient });
  const telemetry = new TelemetryCollector({
    publishableKey: opts.publishableKey,
    secretKey: opts.secretKey,
    samplingRate: 0.1,
    ...opts.sdkMetadata ? { sdk: opts.sdkMetadata.name, sdkVersion: opts.sdkMetadata.version } : {},
    ...opts.telemetry || {}
  });
  return {
    ...apiClient,
    ...requestState,
    telemetry
  };
}
export {
  createClerkClient,
  verifyToken2 as verifyToken
};
//# sourceMappingURL=index.mjs.map