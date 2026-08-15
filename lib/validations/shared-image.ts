import * as z from 'zod';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const imageFileSchema = (errorSize: string, errorType: string) =>
  z
    .instanceof(File)
    .refine(file => file.size <= MAX_IMAGE_SIZE, errorSize)
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), errorType);
