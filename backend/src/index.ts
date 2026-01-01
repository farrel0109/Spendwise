import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { clerkAuthMiddleware, verifyClerk } from './middleware/clerk';

// Route imports
import usersRouter from './routes/users';
import accountsRouter from './routes/accounts';
import categoriesRouter from './routes/categories';
import transactionsRouter from './routes/transactions';
import budgetsRouter from './routes/budgets';
import goalsRouter from './routes/goals';
import debtsRouter from './routes/debts';
import analyticsRouter from './routes/analytics';
import gamificationRouter from './routes/gamification';
import networthRouter from './routes/networth';
import summaryRouter from './routes/summary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(url => url.trim());
const allowedOrigins = [
  ...frontendUrls,
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// Request size limit
app.use(express.json({ limit: '10mb' })); // Increased for receipt uploads

// Initialize Clerk middleware
app.use(clerkAuthMiddleware);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// ============================================
// Protected API routes
// ============================================

// User management
app.use('/api/users', verifyClerk, usersRouter);

// Multi-account management
app.use('/api/accounts', verifyClerk, accountsRouter);

// Categories
app.use('/api/categories', verifyClerk, categoriesRouter);

// Transactions
app.use('/api/transactions', verifyClerk, transactionsRouter);

// Budget management
app.use('/api/budgets', verifyClerk, budgetsRouter);

// Savings goals
app.use('/api/goals', verifyClerk, goalsRouter);

// Debt tracking
app.use('/api/debts', verifyClerk, debtsRouter);

// Analytics & insights
app.use('/api/analytics', verifyClerk, analyticsRouter);

// Gamification
app.use('/api/gamification', verifyClerk, gamificationRouter);

// Net worth tracking
app.use('/api/networth', verifyClerk, networthRouter);

// Legacy summary endpoint (for backward compatibility)
app.use('/api/summary', verifyClerk, summaryRouter);

// ============================================
// Error handling
// ============================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err);
  }
  
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   SpendWise API v2.0 - Financial Manager   ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   🚀 Server running on port ${PORT}            ║`);
  console.log(`║   📍 Health: http://localhost:${PORT}/health   ║`);
  console.log(`║   🔐 API: http://localhost:${PORT}/api         ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log('Available endpoints:');
  console.log('  /api/users          - User management');
  console.log('  /api/accounts       - Multi-account');
  console.log('  /api/categories     - Categories');
  console.log('  /api/transactions   - Transactions');
  console.log('  /api/budgets        - Budget planning');
  console.log('  /api/goals          - Savings goals');
  console.log('  /api/debts          - Debt tracking');
  console.log('  /api/analytics      - Insights & reports');
  console.log('  /api/gamification   - XP & achievements');
  console.log('  /api/networth       - Net worth tracking');
  console.log('');
});

export default app;
