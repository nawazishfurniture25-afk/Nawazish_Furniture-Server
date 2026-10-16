import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ==================== ADMIN USER ====================
    const adminEmail =
        process.env.ADMIN_EMAIL || 'nawazishfurniture25@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@123';
    const adminName = process.env.ADMIN_NAME || 'Nawazish Admin';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // ⚠️ UPDATE field me values daalo taaki re-seed pe update ho
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            name: adminName,
            role: 'SUPER_ADMIN',
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: 'SUPER_ADMIN',
        },
    });

    console.log(`✅ Admin user: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);

    // ==================== SAMPLE PRODUCTS ====================
    const products = [
        {
            slug: 'narmada-sectional',
            name: 'The Narmada Sectional',
            shortDesc: '6-Seater · Brown Velvet',
            description:
                'A handcrafted 6-seater sectional with brown velvet body, cream tufted cushions, and gold piping on turned Sheesham legs.',
            price: 4200000,
            mrp: 5000000,
            category: 'L-Shape',
            fabric: 'Brown Velvet',
            dimensions: '84 x 36 x 32 inches',
            tag: 'Signature',
            featured: true,
            images: {
                create: [
                    {
                        url: '/images/narmada-1.jpg',
                        alt: 'Narmada Sectional in brown velvet',
                        isPrimary: true,
                    },
                ],
            },
        },
        {
            slug: 'mahakoshal-3-seater',
            name: 'Mahakoshal 3-Seater',
            shortDesc: '3-Seater · Cream Linen',
            description:
                'A classic 3-seater in cream linen with a sturdy Sheesham frame and high-density foam.',
            price: 2850000,
            mrp: 3300000,
            category: '3-Seater',
            fabric: 'Cream Linen',
            dimensions: '72 x 34 x 30 inches',
            featured: true,
            images: {
                create: [
                    {
                        url: '/images/mahakoshal-1.jpg',
                        alt: 'Mahakoshal 3-seater in cream linen',
                        isPrimary: true,
                    },
                ],
            },
        },
        {
            slug: 'dumna-recliner',
            name: 'Dumna Recliner',
            shortDesc: 'Single Seat · Tufted',
            description:
                'A tufted single-seat recliner with premium leatherette finish and adjustable back.',
            price: 3500000,
            category: 'Recliner',
            fabric: 'Leatherette',
            dimensions: '36 x 38 x 40 inches',
            tag: 'New',
            featured: true,
            images: {
                create: [
                    {
                        url: '/images/dumna-1.jpg',
                        alt: 'Dumna tufted recliner',
                        isPrimary: true,
                    },
                ],
            },
        },
        {
            slug: 'sipri-diwan',
            name: 'Sipri Diwan',
            shortDesc: 'Traditional · Tufted Cream',
            description:
                'A traditional tufted diwan in cream fabric, perfect for living rooms and courtyards.',
            price: 2400000,
            category: 'Diwan',
            fabric: 'Cream Cotton',
            dimensions: '72 x 30 x 20 inches',
            images: {
                create: [
                    {
                        url: '/images/sipri-1.jpg',
                        alt: 'Sipri traditional diwan',
                        isPrimary: true,
                    },
                ],
            },
        },
        {
            slug: 'bhedaghat-sofa-cum-bed',
            name: 'Bhedaghat Sofa Cum Bed',
            shortDesc: 'Convertible · HR Foam',
            description:
                'Convertible sofa cum bed with HR foam and sturdy frame. Great for compact homes.',
            price: 2600000,
            category: 'Sofa Cum Bed',
            fabric: 'Poly Cotton',
            dimensions: '72 x 36 x 32 inches',
            images: {
                create: [
                    {
                        url: '/images/bhedaghat-1.jpg',
                        alt: 'Bhedaghat sofa cum bed',
                        isPrimary: true,
                    },
                ],
            },
        },
        {
            slug: 'bulk-modular-commission',
            name: 'Bulk Modular Commission',
            shortDesc: 'Custom Layout · Any Fabric',
            description:
                'Custom modular layouts for hotels, offices, and showrooms. Quote per project.',
            price: 5500000,
            category: 'L-Shape',
            fabric: 'Your Choice',
            dimensions: 'Custom',
            tag: 'Atelier',
            images: {
                create: [
                    {
                        url: '/images/bulk-1.jpg',
                        alt: 'Bulk modular furniture',
                        isPrimary: true,
                    },
                ],
            },
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { slug: product.slug },
            update: {},
            create: product,
        });
        console.log(`✅ Product: ${product.name}`);
    }

    // ==================== SETTINGS ====================
    const settings = [
        { key: 'business_name', value: 'Nawazish Furniture' },
        { key: 'phone', value: '+91 9713624142' },
        { key: 'whatsapp', value: '919713624142' },
        { key: 'email', value: 'nawazishfurniture25@gmail.com' },
        {
            key: 'address',
            value:
                '5WWQ+499, Raddi Chowki, Gazi Nagar, Adhartal, Jabalpur, MP — 482004',
        },
        {
            key: 'delivery_notice',
            value: 'We currently deliver within Madhya Pradesh only',
        },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
        });
    }

    console.log('✅ Settings saved');
    console.log('');
    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });