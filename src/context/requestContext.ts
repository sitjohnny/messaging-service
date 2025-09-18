import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
    uuid?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestUuid(): string | undefined {
    const store = requestContext.getStore();
    return store?.uuid;
}
