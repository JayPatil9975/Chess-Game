const socket = io();

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }
      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });
  if(playerRole == "b"){
    boardElement.classList.add("flipped");
  }else{
    boardElement.classList.remove("flipped");
  }
};


const handleMove = (source, target) => {
    const move = {
        from : `${String.fromCharCode(97+source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8 - target.row}`,
        promotion : "q"
    }
    socket.emit("move", move);
};
const getPieceUnicode = (piece) => {
    const unicodePieces = {
      w: {
        K: '\u2654',  // White King ♔
        Q: '\u2655',  // White Queen ♕
        R: '\u2656',  // White Rook ♖
        B: '\u2657',  // White Bishop ♗
        N: '\u2658',  // White Knight ♘
        P: '\u2659'   // White Pawn ♙
      },
      b: {
        K: '\u265A',  // Black King ♚
        Q: '\u265B',  // Black Queen ♛
        R: '\u265C',  // Black Rook ♜
        B: '\u265D',  // Black Bishop ♝
        N: '\u265E',  // Black Knight ♞
        P: '\u265F'   // Black Pawn ♟
      }
    };
    // Return the correct piece based on color and type
    return unicodePieces[piece.color][piece.type.toUpperCase()] || "";
  };

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});
socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});
socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});
socket.on("move", (move) => {
    chess.load(move);
    renderBoard();
});
  
renderBoard();
