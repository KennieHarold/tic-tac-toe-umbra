import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Game from './Game';
import NewGame from './NewGame';

const columns = [
  {
    name: 'Game session ID',
    selector: (row: any) => row._id
  },
  {
    name: 'Player 1',
    selector: (row: any) => row.player1Name
  },
  {
    name: 'Player 2',
    selector: (row: any) => row.player2Name
  },
  {
    name: 'Current Round',
    selector: (row: any) => row.currentRound
  },
  {
    name: 'Wins',
    selector: (row: any) => `${row.player1Wins} - ${row.player2Wins}`
  }
];

function Home() {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const [sessions, setSessions] = useState([]);

  const loadGameData = useCallback(async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/game`);
    if (response.status === 200 && response.ok) {
      const jsonData = await response.json();
      setSessions(jsonData.gameSessions);
    }
  }, []);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  return (
    <div className="min-h-screen min-w-full">
      <div className="grid grid-cols-2 gap-12 p-10 min-h-screen">
        <div className="col-span-1 bg-gray-700/25 rounded-md flex items-center justify-center p-8">
          {path === 'game' ? (
            <Game />
          ) : path === 'new' ? (
            <NewGame />
          ) : path === '' ? (
            <Link to="/new">
              <button className="bg-blue-600 px-5 py-2 rounded-full">Start New Game</button>
            </Link>
          ) : (
            <h1>Something went wrong</h1>
          )}
        </div>
        <div className="col-span-1">
          <DataTable columns={columns} data={sessions} pagination />
        </div>
      </div>
    </div>
  );
}

export default Home;
