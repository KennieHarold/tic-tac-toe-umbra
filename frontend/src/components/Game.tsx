import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BoardProps {
  session: string;
  round: string;
  initialSquares: string[];
  isXTurn: boolean;
  player1Name: string;
  player2Name: string;
  winnerProp: number | null;
  player1Wins: number;
  player2Wins: number;
}

function calculateWinner(squares: string[]) {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < winningLines.length; i++) {
    const [a, b, c] = winningLines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function Board({
  session,
  round,
  initialSquares,
  isXTurn,
  player1Name,
  player2Name,
  winnerProp,
  player1Wins,
  player2Wins
}: BoardProps) {
  const navigate = useNavigate();
  const [squares, setSquares] = useState(Array<string>(9).fill(''));
  const [xIsNext, setXIsNext] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const handleClick = (i: number) => {
    const squaresCopy = squares.slice() as string[];

    if (calculateWinner(squaresCopy) || squaresCopy[i]) {
      return;
    }

    squaresCopy[i] = xIsNext ? 'X' : 'O';
    const winner = calculateWinner(squaresCopy as string[]);

    const data = {
      gameState: squaresCopy,
      xIsNext: !xIsNext,
      ...(winner ? (winner === 'X' ? { winner: 1 } : { winner: 2 }) : null)
    };

    fetch(`${process.env.REACT_APP_API_URL}/game/${session}/round/${round}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    setSquares(squaresCopy);
    setXIsNext(!xIsNext);
    setStatus(winner);
  };

  const handleNewRound = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/game/${session}/round`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (response.status === 201) {
      window.location.href = `/game/${session}/round/${parseInt(round, 10) + 1}`;
    }
  }, [round, session]);

  const renderSquare = (i: number) => {
    return (
      <button
        className="w-1/3 h-36 my-2 mx-2 border border-1 text-4xl font-bold"
        onClick={() => handleClick(i)}
      >
        {squares[i]}
      </button>
    );
  };

  useEffect(() => {
    setSquares(initialSquares);
    setXIsNext(isXTurn);
    if (winnerProp) {
      setStatus(winnerProp === 1 ? 'X' : 'O');
    }
  }, [initialSquares, isXTurn, winnerProp]);

  return (
    <div>
      <div className="mb-1">
        {status
          ? `Winner: ${status === 'X' ? player1Name : player2Name}`
          : `Next player: ${xIsNext ? player1Name : player2Name}`}
      </div>
      <div className="mb-4">
        Score: {player1Wins} - {player2Wins}
      </div>

      <div className="flex flex-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="flex flex-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="flex flex-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      {status && (
        <div className="mt-6 flex flex-row gap-3">
          <button className="grow py-4 bg-red-600 rounded-full" onClick={() => navigate('/')}>
            Stop
          </button>
          <button className="grow py-4 bg-blue-600 rounded-full" onClick={handleNewRound}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function Game() {
  const location = useLocation();
  const session = location.pathname.split('/')[2];
  const round = location.pathname.split('/')[4];

  const [isError, setIsError] = useState(false);
  const [initialSquares, setInitialSquares] = useState(Array<string>(9).fill(''));
  const [isXTurn, setXTurn] = useState(true);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [winner, setWinner] = useState(null);
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);

  const loadGameSession = useCallback(async () => {
    if (!(session && round)) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/game/${session}/round/${round}`
      );
      if (response.ok && response.status === 200) {
        const { gameSession, round } = await response.json();

        if (!(gameSession && round)) {
          setIsError(true);
        }

        const { player1Name, player2Name, player1Wins, player2Wins } = gameSession;
        const { gameState, xIsNext, winner } = round;

        setXTurn(xIsNext);
        setPlayer1Name(player1Name);
        setPlayer2Name(player2Name);
        setWinner(winner);
        setPlayer1Wins(player1Wins);
        setPlayer2Wins(player2Wins);

        if (gameState.length > 0) {
          setInitialSquares(gameState);
        }
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, [session, round]);

  useEffect(() => {
    loadGameSession();
  }, [loadGameSession]);

  return (
    <div className="w-full h-full">
      {isError ? (
        <span className="text-gray-500">Error loading session</span>
      ) : (
        <Board
          session={session}
          round={round}
          initialSquares={initialSquares}
          isXTurn={isXTurn}
          player1Name={player1Name}
          player2Name={player2Name}
          winnerProp={winner}
          player1Wins={player1Wins}
          player2Wins={player2Wins}
        />
      )}
    </div>
  );
}

export default Game;
