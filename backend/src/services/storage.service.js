import crypto from 'node:crypto';
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const extensionByType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const ensureAzureConfigured = () => {
  if (!env.AZURE_STORAGE_ACCOUNT_NAME || !env.AZURE_STORAGE_ACCOUNT_KEY) {
    throw new AppError('Azure Blob Storage is not configured.', 503, 'STORAGE_NOT_CONFIGURED');
  }
};

export const createImageUploadUrl = ({ contentType, size }) => {
  ensureAzureConfigured();
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new AppError('Only JPEG, PNG, and WebP images are allowed.', 400, 'INVALID_IMAGE_TYPE');
  }
  if (!Number.isInteger(size) || size <= 0 || size > MAX_IMAGE_SIZE) {
    throw new AppError('Images must be between 1 byte and 5 MB.', 400, 'INVALID_IMAGE_SIZE');
  }

  const blobName = `listings/${crypto.randomUUID()}.${extensionByType[contentType]}`;
  const credential = new StorageSharedKeyCredential(env.AZURE_STORAGE_ACCOUNT_NAME, env.AZURE_STORAGE_ACCOUNT_KEY);
  const startsOn = new Date(Date.now() - 60_000);
  const expiresOn = new Date(Date.now() + 5 * 60_000);
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: env.AZURE_STORAGE_CONTAINER_NAME,
      blobName,
      permissions: BlobSASPermissions.parse('cw'),
      startsOn,
      expiresOn,
      contentType
    },
    credential
  ).toString();
  const blobUrl = `https://${env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${env.AZURE_STORAGE_CONTAINER_NAME}/${blobName}`;

  return {
    uploadUrl: `${blobUrl}?${sasToken}`,
    blobUrl,
    expiresAt: expiresOn.toISOString()
  };
};