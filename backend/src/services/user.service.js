import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const publicFields = 'name avatar college verified rating totalTransactions createdAt';

export const getCurrentUser = (id) => User.findById(id);

export const updateCurrentUser = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  return user;
};

export const getPublicUser = async (id) => {
  const user = await User.findById(id).select(publicFields);
  if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  return user;
};