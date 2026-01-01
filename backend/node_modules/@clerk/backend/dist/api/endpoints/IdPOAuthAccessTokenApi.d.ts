import type { IdPOAuthAccessToken } from '../resources';
import { AbstractAPI } from './AbstractApi';
export declare class IdPOAuthAccessTokenApi extends AbstractAPI {
    verify(accessToken: string): Promise<IdPOAuthAccessToken>;
    /**
     * @deprecated Use `verify()` instead. This method will be removed in the next major release.
     */
    verifyAccessToken(accessToken: string): Promise<IdPOAuthAccessToken>;
}
//# sourceMappingURL=IdPOAuthAccessTokenApi.d.ts.map