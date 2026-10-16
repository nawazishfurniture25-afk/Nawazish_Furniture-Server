import './lib/env.js';   // ← SABSE PEHLA IMPORT (dotenv load)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');

const app = express();

// ==================== SECURITY ====================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// ==================== CORS ====================
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts. Try again in 15 minutes.',
    },
});
app.use('/api/auth/login', authLimiter);

// ==================== PARSERS ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== LOGGING ====================
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ==================== STATIC FILE SERVING (UPLOADS) ====================
const uploadsPath = path.join(
    SERVER_ROOT,
    process.env.LOCAL_UPLOAD_PATH || 'uploads'
);

app.use(
    `/${process.env.LOCAL_UPLOAD_PATH || 'uploads'}`,
    express.static(uploadsPath, {
        maxAge: '1y',
        immutable: true,
        etag: true,
    })
);
// ==================== STATIC FILE SERVING (PUBLIC: logo, etc.) ====================
const publicPath = path.join(SERVER_ROOT, 'public');

app.use(
    '/public',
    express.static(publicPath, {
        maxAge: '1y',
        immutable: true,
        etag: true,
    })
);

// ==================== ROUTES ====================
app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Nawazish Furniture API',
        version: '1.0.0',
        uploadProvider: process.env.UPLOAD_PROVIDER || 'local',
    });
});

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════');
    console.log(`   Nawazish Furniture API`);
    console.log(`   Server: http://localhost:${PORT}`);
    console.log(`   Env: ${process.env.NODE_ENV}`);
    console.log(`   Upload provider: ${process.env.UPLOAD_PROVIDER || 'local'}`);
    console.log('🚀 ═══════════════════════════════════════════');
    console.log('');
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    process.exit(1);
});