import { OldCapabilitiesApi, UnionCapabilities } from '../types/summarizer-api-definition.type';

export function isOldCapabilitiesApi(capabilities: UnionCapabilities): capabilities is OldCapabilitiesApi {
    return  (capabilities as OldCapabilitiesApi).supportsFormat !== undefined && 
        (capabilities as OldCapabilitiesApi).supportsType !== undefined &&
        (capabilities as OldCapabilitiesApi).supportsLength !== undefined;
}
