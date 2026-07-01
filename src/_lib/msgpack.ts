import { decode } from '@msgpack/msgpack';

export async function loadDecodedMsgpack<T>(
  assetUrl: string,
  errorMessage: string
): Promise<T> {
  const response = await fetch(assetUrl);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return decode(bytes) as T;
}
