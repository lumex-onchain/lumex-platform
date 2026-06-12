import express from 'express';
import dotenv from 'dotenv';
import { logger } from '@lumex/shared';
import { sep12Router } from './sep12/router';
import { sep38Router } from './sep38/router';
import { callbackRouter } from './callbacks/router';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());
app.use(requestLogger);

// Health check — no auth required
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'lumex-business-server' }));

// SEP-12 customer KYC — called by Stellar Anchor Platform
app.use('/sep12', authMiddleware, sep12Router);

// SEP-38 quotes — called by Anchor Platform for price discovery
app.use('/sep38', sep38Router);

// Deposit/withdrawal callbacks from Anchor Platform
app.use('/callbacks', authMiddleware, callbackRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`[business-server] Listening on port ${PORT}`);
});

export default app;
