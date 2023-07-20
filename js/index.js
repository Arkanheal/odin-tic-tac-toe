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
  const resetBoard = () => gameboard = gameboard.map(e => ({...e, symbol: ""}));

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

  return { getBoard, updateBoard, resetBoard };
})();

const Player = (symbol, ...name) => {
  const cleanedName = name[0] ?? symbol;
  return { symbol, name: cleanedName };
}

const GameController = (() => {
  let players = [Player("X"), Player("O")];

  const setPlayersName = (name1, name2) => {
    players[0].name = name1;
    players[1].name = name2;
  }

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

  return { getActivePlayer, playTurn, setPlayersName };
})();

const ScreenController = ((doc) => {

  const gameboardDiv = doc.querySelector(".gameboard");
  const turnDiv = doc.querySelector(".turn");
  const resultDiv = doc.querySelector(".result");
  const formDiv = doc.querySelector("#form");
  let res = "";

  const displayBoard = () => {
    const gameboard = GameBoard.getBoard();
    formDiv.addEventListener("submit", submitHandler);

    resultDiv.style.display = "none";
    turnDiv.innerHTML = `${GameController.getActivePlayer().name}'s turn.`;
    turnDiv.style.display = "block";

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
    resultDiv.innerHTML = res === "Tie" ? "It's a Tie" : `${GameController.getActivePlayer().name} won.`;
    resultDiv.style.display = "block";
    turnDiv.style.display = "none";
    res = "";
  }

  const clickHandler = (e) => {
    const cellIndex = e.target.dataset.cellIndex;
    res = GameController.playTurn(cellIndex);
    displayBoard();
    displayResult();
  }

  const submitHandler = (e) => {
    e.preventDefault();
    GameBoard.resetBoard();
    const elements = e.target.elements;
    GameController.setPlayersName(elements.player1.value ?? "", elements.player2.value ?? "");
    displayBoard();
  }

  return { displayBoard };

})(document);

ScreenController.displayBoard();
