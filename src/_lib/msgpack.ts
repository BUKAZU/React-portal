import { decode } from '@msgpack/msgpack';

export async function loadDecodedMsgpack<T>(
  assetUrl: string,
  errorMessage: string
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(assetUrl);
  } catch {
    throw new Error(errorMessage);
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return decode(bytes) as T;
}
