import Ably from 'ably';

const ABLY_KEY = import.meta.env.VITE_PUBLIC_ABLY_API_KEY;

export const ably = new Ably.Realtime(ABLY_KEY!);
