import { CapabilitiesApi, UnionCapabilities } from '../types/summarizer-api-definition.type';

export function isCapabilitiesApi(capabilities: UnionCapabilities): capabilities is CapabilitiesApi {
    return  (capabilities as CapabilitiesApi).createOptionsAvailable !== undefined
}
