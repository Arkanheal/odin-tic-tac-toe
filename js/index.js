const GameBoard = (() => {
  let gameboard = [
    { magic: 2 },
    { magic: 7 },
    { magic: 6 },
    { magic: 9 },
    { magic: 5 },
    { magic: 1 },
    { magic: 4 },
    { magic: 3 },
    { magic: 8 },
  ].map(e => ({ ...e, symbol: "" }));

  const getBoard = () => gameboard;

  const getSumMagic = (acc, e) => e.symbol === GameController.getActivePlayer().symbol ? acc + e.magic : acc;

  // 2 | 7 | 6
  // 9 | 5 | 1
  // 4 | 3 | 8
  const isWin = () => {
    const diagLeft = [gameboard[0], gameboard[4], gameboard[8]].reduce(getSumMagic, 0);
    if (diagLeft === 15) return true;
    const diagRight = [gameboard[6], gameboard[4], gameboard[2]].reduce(getSumMagic, 0);
    if (diagRight === 15) return true;
    for (let i = 0; i < 7; i += 3) {
      const rowValue = [gameboard[i], gameboard[i + 1], gameboard[i + 2]].reduce(getSumMagic, 0);
      if (rowValue === 15) return true;
    }
    for (let i = 0; i < 3; ++i) {
      const colValue = [gameboard[i], gameboard[i + 3], gameboard[i + 6]].reduce(getSumMagic, 0);
      if (colValue === 15) return true;
    }
    return false;
  }

  const isDraw = () => {
    return gameboard.filter(c => c.symbol === "").length === 0;
  }

  const updateBoard = (idx, symbol) => {
    if (!!gameboard[idx]["symbol"]) {
      return { turn: false, won: false, over: false };
    }
    gameboard[idx]["symbol"] = symbol;
    if (isWin()) return { turn: false, won: true, over: true };
    if (isDraw()) return { turn: false, won: false, over: true };
    return { turn: true, won: false, over: false };
  }

  return { getBoard, updateBoard };
})();

const Player = (symbol) => {
  return { symbol };
}

const GameController = (() => {
  const players = [Player("X"), Player("O")];

  let activePlayer = players[0];
  const switchTurn = () => activePlayer = activePlayer === players[0] ? players[1] : players[0];
  const getActivePlayer = () => activePlayer;

  const playTurn = (idx) => {
    const turnRes = GameBoard.updateBoard(idx, activePlayer.symbol);
    if (!turnRes.over && !turnRes.turn) {
      return;
    }
    if (!turnRes.turn && turnRes.won) {
      return "Won";
    }
    if (!turnRes.turn && turnRes.over) {
      return "Tie";
    }

    switchTurn();
  }

  return { getActivePlayer, playTurn };
})();

const ScreenController = ((doc) => {

  const gameboardDiv = doc.querySelector(".gameboard");
  const gameboard = GameBoard.getBoard();
  let res = "";

  const displayBoard = () => {
    // Resets the board
    gameboardDiv.innerHTML = "";

    // Adds the new ones
    for (let i = 0; i < gameboard.length; ++i) {
      const boardCell = gameboard[i];
      const cellDiv = doc.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.dataset.cellIndex = i;
      cellDiv.innerHTML = boardCell.symbol;
      if (!res) cellDiv.addEventListener("click", clickHandler);

      gameboardDiv.appendChild(cellDiv);
    }
  }

  const displayResult = () => {
    if (!res) return;
    const resultDiv = doc.querySelector(".result");
    resultDiv.innerHTML = res === "Tie" ? "It's a Tie" : `${GameController.getActivePlayer().symbol} won.`;
  }

  const clickHandler = (e) => {
    const cellIndex = e.target.dataset.cellIndex;
    res = GameController.playTurn(cellIndex);
    displayBoard();
    displayResult();
  }


  return { displayBoard };

})(document);

ScreenController.displayBoard();
