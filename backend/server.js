import express from 'express';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {initDatabase} from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

try {
    initDatabase();
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

// Middleware
app.use(express.json());

app.use((req, res, next) => {
    // Log API requests only (skip static files)
    if (!req.url.includes('.') && !req.url.includes('/api/')) {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Quick-Open Vote is running!'
    });
});

// API routes
import sessionsRouter from './routes/sessions.js';
import resultsRouter from './routes/results.js';
import voteRouter from './routes/vote.js';
import candidatesRouter from './routes/candidates.js';
import votersRouter from './routes/voters.js';

app.use('/api/sessions', sessionsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/vote', voteRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/voters', votersRouter);

// Serve static files from frontend
const frontendPath = join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// SPA fallback: serve index.html for non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            error: 'API endpoint not found',
            message: `Cannot ${req.method} ${req.url}`
        });
    }
    res.sendFile(join(frontendPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
