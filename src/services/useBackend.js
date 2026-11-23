import { useSyncExternalStore } from 'react';
import { getBackend, subscribeBackend } from './ai';

/** { checking, reachable, text, image, edit, status, error }: what the connected server can do right now. */
export const useBackend = () => useSyncExternalStore(subscribeBackend, getBackend, getBackend);
