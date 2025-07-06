import { BlobServiceClient } from "@azure/storage-blob";

export async function uploadPdfBuffer(
  buffer: Buffer,
  blobName: string
): Promise<string> {
  const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING;
  const containerName = process.env.BLOB_CONTAINER_NAME;

  if (!connectionString || !containerName) {
    throw new Error(
      "Blob storage connection string or container name is not set."
    );
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });

  return blockBlobClient.url;
}
