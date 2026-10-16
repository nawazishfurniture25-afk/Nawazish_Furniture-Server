import { uploadToLocal, deleteFromLocal } from './local.provider.js';
import {
    uploadToCloudinary,
    deleteFromCloudinary,
} from './cloudinary.provider.js';
import { uploadToR2, deleteFromR2 } from './r2.provider.js';

const PROVIDER = process.env.UPLOAD_PROVIDER || 'local';

/**
 * Upload image via configured provider
 */
export async function uploadImage(file, folder = 'products') {
    switch (PROVIDER) {
        case 'cloudinary':
            return uploadToCloudinary(file, folder);
        case 'r2':
            return uploadToR2(file, folder);
        case 'local':
        default:
            return uploadToLocal(file, folder);
    }
}

/**
 * Delete image via configured provider
 */
export async function deleteImage(key) {
    switch (PROVIDER) {
        case 'cloudinary':
            return deleteFromCloudinary(key);
        case 'r2':
            return deleteFromR2(key);
        case 'local':
        default:
            return deleteFromLocal(key);
    }
}

export const currentProvider = PROVIDER;