import mongoose, { Schema, Types } from 'mongoose';

export interface IRoundSchema {
  gameSessionId: Types.ObjectId;
  gameState: string[];
  xIsNext: boolean;
  winner: number;
  roundNum: number;
}

const RoundSchema = new Schema<IRoundSchema>(
  {
    gameSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'gameSession'
    },
    gameState: [String],
    xIsNext: Boolean,
    winner: Number,
    roundNum: Number
  },
  { timestamps: true }
);

export default mongoose.model('round', RoundSchema);
