import { useState } from 'react'
import './App.css'

const GRID_SIZE = 10;
const WORDS = ['REACT', 'VITE', 'TYPESCRIPT', 'JAVASCRIPT', 'COMPILER', 'HOOK', 'STATE', 'PROPS', 'COMPONENT', 'CONTEXT'];

type Cell = {
  letter: string;
  selected: boolean;
  found: boolean;
};

type Position = { row: number; col: number };

function generateEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ letter: '', selected: false, found: false }))
  );
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function placeWords(grid: Cell[][], words: string[]): Cell[][] {
  const directions = [
    { dr: 0, dc: 1 }, // right
    { dr: 1, dc: 0 }, // down
    { dr: 1, dc: 1 }, // diagonal down-right
    { dr: -1, dc: 1 }, // diagonal up-right
  ];
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  for (const word of words) {
    let placed = false;
    for (let tries = 0; tries < 100 && !placed; tries++) {
      const dir = directions[getRandomInt(directions.length)];
      const row = getRandomInt(GRID_SIZE);
      const col = getRandomInt(GRID_SIZE);
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dir.dr * i;
        const c = col + dir.dc * i;
        if (
          r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE ||
          (newGrid[r][c].letter && newGrid[r][c].letter !== word[i])
        ) {
          fits = false;
          break;
        }
      }
      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i;
          const c = col + dir.dc * i;
          newGrid[r][c].letter = word[i];
        }
        placed = true;
      }
    }
  }
  // Fill empty cells with random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!newGrid[r][c].letter) {
        newGrid[r][c].letter = String.fromCharCode(65 + getRandomInt(26));
      }
    }
  }
  return newGrid;
}

function App() {
  const [grid, setGrid] = useState<Cell[][]>(() => placeWords(generateEmptyGrid(), WORDS));
  const [foundWords, setFoundWords] = useState<string[]>([]);

  function handleCellClick(row: number, col: number) {
    if (grid[row][col].found) return;
    // Selection logic: select start and end cell for a word
    setGrid(g => {
      const prevSelected = g.flatMap((row, rIdx) => row.map((cell, cIdx) => cell.selected ? { row: rIdx, col: cIdx } : null).filter(Boolean) as Position[]);
      let newGrid = g.map(row => row.map(cell => ({ ...cell, selected: false })));
      if (prevSelected.length === 0) {
        newGrid[row][col].selected = true;
      } else if (prevSelected.length === 1) {
        const start = prevSelected[0];
        const end = { row, col };
        const dr = Math.sign(end.row - start.row);
        const dc = Math.sign(end.col - start.col);
        let word = '';
        let positions: Position[] = [];
        let r = start.row, c = start.col;
        while (r !== end.row + dr || c !== end.col + dc) {
          word += g[r][c].letter;
          positions.push({ row: r, col: c });
          if (r === end.row && c === end.col) break;
          r += dr;
          c += dc;
        }
        const reversed = word.split('').reverse().join('');
        const found = WORDS.find(w => w === word || w === reversed);
        if (found && !foundWords.includes(found)) {
          setFoundWords([...foundWords, found]);
          newGrid = newGrid.map(row => row.map(cell => ({ ...cell })));
          for (const pos of positions) {
            newGrid[pos.row][pos.col].found = true;
          }
        }
      }
      return newGrid;
    });
  }

  return (
    <div className="wordsearch-container">
      <h1>Wordsearch Game</h1>
      <div className="grid">
        {grid.map((row, rIdx) => (
          <div className="row" key={rIdx}>
            {row.map((cell, cIdx) => (
              <button
                key={cIdx}
                className={`cell${cell.found ? ' found' : ''}`}
                onClick={() => handleCellClick(rIdx, cIdx)}
                disabled={cell.found}
              >
                {cell.letter}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="words-list">
        <h2>Find these words:</h2>
        <ul>
          {WORDS.map(word => (
            <li key={word} className={foundWords.includes(word) ? 'found-word' : ''}>{word}</li>
          ))}
        </ul>
      </div>
      {foundWords.length === WORDS.length && <h2>Congratulations! You found all words!</h2>}
    </div>
  );
}

export default App
