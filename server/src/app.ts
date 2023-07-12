import { createServer } from 'http';
import config from 'config';
import express, { Request } from 'express';
import cors from 'cors';
import { log, reportError } from '@/utils/logger';
import GameSession from './models/GameSession';
import mongoose from 'mongoose';
import Round from './models/Round';

interface PostGameRequestBody {
  player1Name: string;
  player2Name: string;
}

interface PatchGameRequestBody {
  gameState: string[][];
  xIsNext: boolean;
  winner?: number;
}

interface PostRoundRequestBody {}

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.set('trust proxy', 1);
app.use(cors());

// Routers
const baseApiUrl = config.get<string>('baseApiUrl');

app.get('/', (_, res) => {
  res.send('Hello world!');
});

app.post(`${baseApiUrl}/game`, async (req: Request<{}, {}, PostGameRequestBody>, res) => {
  const { player1Name, player2Name } = req.body;

  if (!(player1Name || player2Name)) {
    return res.status(401).json({ error: 'Missing params' });
  }

  try {
    const newGameSession = await new GameSession({
      player1Name,
      player2Name,
      wins: [0, 0],
      currentRound: 1
    }).save();

    await new Round({
      gameSessionId: newGameSession._id,
      gameState: Array<string>(9).fill(''),
      xIsNext: true,
      roundNum: 1
    }).save();

    res.status(201).json({ sessionId: newGameSession._id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    reportError(error as Error);
  }
});

app.post(
  `${baseApiUrl}/game/:sessionId/round`,
  async (req: Request<{ sessionId: string }, {}, PostRoundRequestBody>, res) => {
    const sessionId = req.params.sessionId;

    try {
      const gameSession = await GameSession.findByIdAndUpdate(
        sessionId,
        {
          $inc: { currentRound: 1 }
        },
        { new: true }
      ).exec();

      if (!gameSession) {
        return res.status(404).json({ error: 'game not found' });
      }

      await new Round({
        gameSessionId: sessionId,
        gameState: Array<string>(9).fill(''),
        xIsNext: true,
        roundNum: gameSession.currentRound
      }).save();

      return res.status(201).json({ message: 'success' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

app.patch(
  `${baseApiUrl}/game/:sessionId/round/:round`,
  async (req: Request<{ sessionId: string; round: number }, {}, PatchGameRequestBody>, res) => {
    const sessionId = req.params.sessionId;
    const round = req.params.round;

    const { winner, gameState, xIsNext } = req.body;

    if (!gameState) {
      return res.status(401).json({ error: 'Missing params' });
    }

    try {
      const updatedRound = await Round.findOneAndUpdate(
        {
          gameSessionId: sessionId,
          roundNum: round
        },
        {
          ...(winner && { winner }),
          gameState,
          xIsNext
        },
        { new: true }
      );

      if (typeof winner === 'number') {
        await GameSession.findByIdAndUpdate(sessionId, {
          ...(winner === 1 ? { $inc: { player1Wins: 1 } } : { $inc: { player2Wins: 1 } })
        });
      }

      res.status(200).json({ round: updatedRound });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      reportError(error as Error);
    }
  }
);

app.get(`${baseApiUrl}/game`, async (_, res) => {
  const gameSessions = await GameSession.find({}).exec();
  return res.status(200).json({ gameSessions });
});

app.get(
  `${baseApiUrl}/game/:sessionId/round/:round`,
  async (req: Request<{ sessionId: string; round: number }, {}, {}>, res) => {
    const sessionId = req.params.sessionId;
    const roundNum = req.params.round;

    const gameSession = await GameSession.findById(sessionId).exec();
    const round = await Round.findOne({ gameSessionId: sessionId, roundNum }).exec();

    if (!gameSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(200).json({ gameSession, round });
  }
);

// Run server
const port = config.get<number>('port');
const host = config.get<string>('host');
const mongodbUrl = config.get<string>('mongodbUrl');

console.log('✨ Server v1');
httpServer.listen(port, host, async () => {
  log.info(`🚀 Server listening on port ${port}`);

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongodbUrl);

  log.info(`🚀 Connected to Database`);
});

export default app;
