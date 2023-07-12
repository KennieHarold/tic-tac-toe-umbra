import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function NewGame() {
  const player1Ref = useRef<HTMLInputElement>(null);
  const player2Ref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (player1Ref.current?.value && player2Ref.current?.value) {
      const data = {
        player1Name: player1Ref.current.value,
        player2Name: player2Ref.current.value
      };

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/game` as string, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok && response.status === 201) {
          const jsonData = await response.json();
          navigate(`/game/${jsonData.sessionId}/round/1`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-8">
      <div className="flex flex-col mb-8">
        <div className="mb-2">Enter Player 1 Name:</div>
        <input
          ref={player1Ref}
          className="bg-transparent outline-none focus:outline-none border border-1 focus:border-1 focus:ring-1 rounded-md text-md p-3 text-zinc-400"
        />
      </div>
      <div className="flex flex-col mb-12">
        <div className="mb-2">Enter Player 2 Name:</div>
        <input
          ref={player2Ref}
          className="bg-transparent outline-none focus:outline-none border border-1 focus:border-1 focus:ring-1 rounded-md text-md p-3 text-zinc-400"
        />
      </div>
      <button className="bg-blue-600 py-4 text-lg rounded-full" onClick={handleStart}>
        Start
      </button>
    </div>
  );
}

export default React.memo(NewGame);
