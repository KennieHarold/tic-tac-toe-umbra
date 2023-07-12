import mongoose, { Schema, Types } from 'mongoose';

export interface IGameSessionSchema {
  player1Name: string;
  player2Name: string;
  player1Wins: number;
  player2Wins: number;
  currentRound: number;
}

const GameSessionSchema = new Schema<IGameSessionSchema>(
  {
    player1Name: String,
    player2Name: String,
    player1Wins: {
      type: Number,
      default: 0
    },
    player2Wins: {
      type: Number,
      default: 0
    },
    currentRound: Number
  },
  { timestamps: true }
);

export default mongoose.model('gameSession', GameSessionSchema);
