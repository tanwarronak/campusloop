import { asyncHandler } from '../utils/asyncHandler.js';
import { acceptOffer, counterOffer, createOffer, rejectOffer } from '../services/offer.service.js';

const emitUpdate = (req, offer, event) => req.app.get('io')?.to(`conversation:${offer.conversationId}`).emit(event, offer);

export const postOffer = asyncHandler(async (req, res) => {
  const data = await createOffer(req.user.id, req.body.conversationId, req.body.amount);
  emitUpdate(req, data, 'offer:new');
  res.status(201).json({ success: true, message: 'Offer created successfully', data });
});

export const patchCounter = asyncHandler(async (req, res) => {
  const data = await counterOffer(req.user.id, req.params.id, req.body.amount);
  emitUpdate(req, data, 'offer:updated');
  res.json({ success: true, message: 'Counter-offer created successfully', data });
});

export const patchReject = asyncHandler(async (req, res) => {
  const data = await rejectOffer(req.user.id, req.params.id);
  emitUpdate(req, data, 'offer:updated');
  res.json({ success: true, message: 'Offer rejected successfully', data });
});

export const patchAccept = asyncHandler(async (req, res) => {
  const data = await acceptOffer(req.user.id, req.params.id);
  emitUpdate(req, data, 'offer:updated');
  req.app.get('io')?.to(`conversation:${data.conversationId}`).emit('listing:sold', data);
  res.json({ success: true, message: 'Offer accepted and listing sold', data });
});