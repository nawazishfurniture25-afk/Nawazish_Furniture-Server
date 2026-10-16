import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/ folder
const SERVER_ROOT = path.resolve(__dirname, '../../..');
const UPLOAD_BASE = path.join(
    SERVER_ROOT,
    process.env.LOCAL_UPLOAD_PATH || 'uploads'
);

// Ensure folder exists
async function ensureFolder(folderPath) {
    try {
        await fs.access(folderPath);
    } catch {
        await fs.mkdir(folderPath, { recursive: true });
    }
}

/**
 * Upload file to local storage
 * @param {Object} file - Multer file (buffer, originalname, mimetype)
 * @param {String} folder - Subfolder (default: 'products')
 * @returns {Promise<{url, key, path}>}
 */
export async function uploadToLocal(file, folder = 'products') {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `${Date.now()}-${crypto
        .randomBytes(6)
        .toString('hex')}${ext}`;

    const targetFolder = path.join(UPLOAD_BASE, folder);
    await ensureFolder(targetFolder);

    const filePath = path.join(targetFolder, filename);
    await fs.writeFile(filePath, file.buffer);

    const publicUrl =
        process.env.LOCAL_PUBLIC_URL || 'http://localhost:5000';
    const relativePath = `${process.env.LOCAL_UPLOAD_PATH || 'uploads'}/${folder}/${filename}`;
    const url = `${publicUrl}/${relativePath}`;
    const key = `${folder}/${filename}`;

    return { url, key, path: filePath };
}

/**
 * Delete file from local storage
 * @param {String} key - File key (e.g. 'products/12345-abc.jpg')
 */
export async function deleteFromLocal(key) {
    if (!key) return;

    const filePath = path.join(UPLOAD_BASE, key);

    try {
        await fs.unlink(filePath);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        // File already gone — ignore
    }
}