import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(file, folder = 'products') {
    const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `nawazish-furniture/${folder}`,
                transformation: [
                    { width: 1200, height: 900, crop: 'fill', quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(file.buffer);
    });

    return {
        url: result.secure_url,
        key: result.public_id,
    };
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(key) {
    if (!key) return;
    await cloudinary.uploader.destroy(key);
}