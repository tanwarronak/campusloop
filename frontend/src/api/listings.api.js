import api from './axios';

export const getListings = async (params) => {
  const response = await api.get('/listings', { params });
  return response.data;
};

export const getListing = async (id) => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

export const createListing = async (listing) => {
  const response = await api.post('/listings', listing);
  return response.data;
};

export const uploadListingImage = async (file) => {
  const response = await api.post('/storage/upload-url', {
    contentType: file.type,
    size: file.size
  });
  const uploadResponse = await fetch(response.data.uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type
    },
    body: file
  });
  if (!uploadResponse.ok) {
    const details = await uploadResponse.text();
    throw new Error(`Image upload failed (${uploadResponse.status}). ${details.slice(0, 160)}`);
  }
  return response.data.blobUrl;
};