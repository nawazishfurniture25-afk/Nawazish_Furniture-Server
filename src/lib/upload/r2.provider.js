// Cloudflare R2 — Future me use karenge
// Jab card mile aur R2 setup ho jaye, tab isko complete karenge

export async function uploadToR2(file, folder = 'products') {
    throw new Error(
        'R2 provider not configured. Please add AWS SDK and R2 credentials in .env'
    );
}

export async function deleteFromR2(key) {
    throw new Error('R2 provider not configured.');
}