export const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";
export const AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

export async function storeBlob(data: string | File, epochs = 5): Promise<string> {
  const body = typeof data === "string" ? new Blob([data], { type: "text/plain" }) : data;

  const res = await fetch(`${PUBLISHER_URL}/v1/blobs?epochs=${epochs}`, {
    method: "PUT",
    body,
  });

  if (!res.ok) {
    throw new Error(`Walrus upload failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // Response shape differs for new vs already-certified blobs
  if (json.newlyCreated) {
    return json.newlyCreated.blobObject.blobId;
  }
  if (json.alreadyCertified) {
    return json.alreadyCertified.blobId;
  }

  throw new Error("Unexpected Walrus response format");
}

export async function readBlob(blobId: string): Promise<string> {
  const res = await fetch(`${AGGREGATOR_URL}/v1/blobs/${blobId}`);
  if (!res.ok) {
    throw new Error(`Failed to read blob: ${res.status}`);
  }
  return res.text();
}

export function getBlobUrl(blobId: string): string {
  return `${AGGREGATOR_URL}/v1/blobs/${blobId}`;
}
