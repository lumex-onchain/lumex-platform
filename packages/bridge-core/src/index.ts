import express from 'express';
import dotenv from 'dotenv';
import { logger } from '@lumex/shared';
import { depositRouter } from './deposit/router';
import { withdrawalRouter } from './withdrawal/router';
import { tradeEventRouter } from './pnl/router';
import { healthRouter } from './utils/health';
import { errorHandler } from './middleware/errorHandler';
import { webhookAuth } from './middleware/webhookAuth';

dotenv.config();

const app = express();
const PORT = process.env.BRIDGE_PORT ?? 3002;

app.use(express.json());
app.use('/health', healthRouter);

// Deposit lifecycle
app.use('/deposit', webhookAuth, depositRouter);

// Withdrawal lifecycle
app.use('/withdrawal', withdrawalRouter);

// Trade events from MT4 bridge plugin
app.use('/trade', webhookAuth, tradeEventRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`[bridge-core] Listening on port ${PORT}`);
  logger.info('[bridge-core] Deposit flow: POST /deposit/complete');
  logger.info('[bridge-core] Trade events: POST /trade/event');
});

export default app;
