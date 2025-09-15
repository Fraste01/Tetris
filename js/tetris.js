//Created all the variables to make the game work
let speed = 0, 
    points = 0,
    level = 1,
    tempSpeed = 0,
    currentTetromino = null, //Tetromino object (square, L, etc)
    currentPosition = null,
    moving = true,
    nextTetromino = null;
 
//Adding events
window.addEventListener("keydown", handleInput); 
window.addEventListener("keyup", handleStopInput);
 
function loadGame() {
    const gameDiv = document.getElementById("gameDiv");
    //Starting the game will create the div of each tile (10x20)
    for (let i = 0; i < 20; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        rowDiv.dataset.y = 20 - i;
        for (let j = 0; j < 10; j++) {
            const tileDiv = document.createElement("div");
            tileDiv.classList.add("emptyTile");
            tileDiv.dataset.x = j;
            tileDiv.dataset.y = 20 - i;
            rowDiv.appendChild(tileDiv);
        }
        gameDiv.appendChild(rowDiv);
    }
    //TODO: Create the div for the score + level + next tetromino
 
    //TODO: Create a countdown and start the game
    speed = 1;
    points = 0;
 
    //Create a random tetromino
    currentTetromino = randomTetromino();
    currentPosition = { x: 4, y: 19 };
 
    drawTetromino(currentPosition);
    drawPreviewTetromino(); //TODO: Create the preview for next tetromino and draw it
 
    setInterval(() => {
        moveDown();
    }, 1000 / (speed * speed * 1.5));
}
 
function moveDown() {
    //TODO: Move the tetromino down by 1 tile
    if (!moving) { 
        return; 
    }
    const previousPosition = { ...currentPosition };
    currentPosition.y--;
    const nextPosition = { ...currentPosition };
 
    //Check if I hit something
    if (currentPosition.y <= 0) {
        hit();
    } else if (checkCollision(nextPosition)) {
        hit();
    } else {
        drawTetromino(previousPosition);
    }
}
 
function checkCollision(nextPosition) {
    //Checking if the tetromino is colliding with something (wall or another tetromino)
    var collision = false;
 
    if (currentTetromino == null || currentTetromino.shape == null) {
        return collision;
    }
 
    for (let i = 0; i < currentTetromino.shape.length; i++) {
        const tile = currentTetromino.shape[i];
        const positionX = tile.x + nextPosition.x;
        const positionY = tile.y + nextPosition.y;
        const tileDiv = document.querySelector(`[data-x="${positionX}"][data-y="${positionY}"]`);
 
        if (tileDiv != null && !tileDiv.classList.contains("currentTile") && tileDiv.classList.contains("tile")) {
            collision = true;
        }
    }
 
    return collision;
}
 
function handleInput(e) {
    const keyCode = e.keyCode;
    //Handle the keyboard input to move the tetromino
    //Default:
    /*
        Key left: move left the tetromino
        Key right: move right the tetromino
        Key down: speed up the falling
        Key up: rotate the tetromino
    */
    //TODO: Add the configuration to change the default keys.
    //TODO: Add the check if moving I hit something if yes do nothing.
    const nextPosition = { ...currentPosition };
    const previousPosition = { ...currentPosition };
 
    if (keyCode === 37) { //Key left
        //Check the max dimension to the left of the tetromino
        for (let i = 0; i < currentTetromino.shape.length; i++) {
            const tile = currentTetromino.shape[i];
            if (tile.x + nextPosition.x <= 0) {
                return;
            }
        }
        nextPosition.x--;
    } else if (keyCode === 39) { //Key right
        //Check the max dimension to the right of the tetromino
        for (let i = 0; i < currentTetromino.shape.length; i++) {
            const tile = currentTetromino.shape[i];
            if (tile.x + nextPosition.x >= 9) {
                return;
            }
        }
        nextPosition.x++;
    } else if (keyCode === 40) { //Key down
        tempSpeed = speed;
        speed = 100;
 
        return;
    } else if (keyCode === 38) { //Key up
        //TODO: Add the check if the new position is colliding if yes stop the rotation
 
        //Rotate the tetromino that is dropping by 90 degrees
        const previousShape = currentTetromino.shape;
        rotateTetromino();
        drawTetromino(previousPosition, previousShape);
 
        return;
    }
 
    if (checkCollision(nextPosition)) {
        return;
    }
 
    currentPosition.x = nextPosition.x;
    drawTetromino(previousPosition);
 
}
 
function handleStopInput(e) {
    const keyCode = e.keyCode;
    if (keyCode === 40) {
        speed = tempSpeed;
    }
}
 
function hit() {
    //Handle when the tetromino hits the ground/another tetromino and stops to move it
    //Give the time to move the tetromino left/right
    moving = false;
    setTimeout(() => {
        let tiles = document.querySelectorAll("div.currentTile");
 
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            tile.classList.remove("currentTile");
        }
 
        checkLine();
        currentTetromino = randomTetromino();
        currentPosition = { x: 4, y: 19 };
        drawTetromino(currentPosition);
        moving = true;
    }, 1000 / speed);    
}
 
function checkLine() {
    //Check if there is a full line and remove it
    document.getElementById("gameDiv").querySelectorAll(".row").forEach((row) => {
        if (row.querySelectorAll(".tile").length === 10) {
            row.childNodes.forEach((tile) => {
                tile.classList.remove("tile");
                tile.classList.add("emptyTile");
            });
 
            //Move all the above tiles down by one
            const posY = parseInt(row.childNodes[0].dataset.y);
            const upperRows = Array.from(document.getElementById("gameDiv").querySelectorAll(".row")).
                                    filter((row) => parseInt(row.childNodes[0].dataset.y) > posY);
 
            upperRows.forEach(upperRow => {
                upperRow.querySelectorAll(".tile").forEach((tileMoving) => {
                    const currentPosy = parseInt(tileMoving.dataset.y);
                    tileMoving.classList.remove("tile");
                    tileMoving.classList.add("emptyTile");
 
                    const lowerPosy = currentPosy - 1;
                    console.log("lower pos y: " + lowerPosy);
                    const tileDiv = document.querySelector(`[data-x="${tileMoving.dataset.x}"][data-y="${lowerPosy}"]`);
                    tileDiv.classList.remove("emptyTile");
                    tileDiv.classList.add("tile");
                });
            });
 
            points += 10;
        }
    });
 
    //Increment speed every 100 points
    if (points > 0 && points % 100 === 0) {
        speedUp();
        //level++;
    }
 
    document.getElementById("level").innerHTML = level;
    document.getElementById("scorePoints").innerHTML = points;
}
 
function speedUp() {
    speed++;
}
 
function randomTetromino() {
    //Create a random tetromino
    let temp;
    do {
        temp = tetrominoList[Math.floor(Math.random() * tetrominoList.length) - 1]
    } while (temp == undefined);
    return temp;
}
 
function drawTetromino(previousPosition, previousShape) {
 
    //Get the shape of the tetromino and draw it
    //Clear previous position of the tetromino
    if (currentTetromino == null) {
        return;
    }
    previousShape = previousShape || currentTetromino.shape;
    const shape = currentTetromino.shape;
 
    //I clear the previous position of the tetromino
    document.querySelectorAll("div.currentTile").forEach((tile) => {
        tile.classList.remove("currentTile");
        tile.classList.remove("tile");
        tile.classList.add("emptyTile");
    })
 
    //Draw the tetromino on the game div
    shape.forEach((tile) => {
        const positionX = tile.x + currentPosition.x;
        const positionY = tile.y + currentPosition.y;
        const tileDiv = document.querySelector(`[data-x="${positionX}"][data-y="${positionY}"]`);
        if (tileDiv != null) {
            tileDiv.classList.add("currentTile");
            tileDiv.classList.remove("emptyTile");
            tileDiv.classList.add("tile");
        }
    });
}
 
function rotateTetromino() {
    //Rotate the tetromino by 90 degrees
    //TODO: Check if it work correctly
    if (currentTetromino == null || currentTetromino.shape == null) {
        return;
    }
 
    if (currentTetromino.name == 'square') {
        return;
    }
 
    const centerX = currentTetromino.shape[0].x;
    const centerY = currentTetromino.shape[0].y;
    currentTetromino.shape.forEach((tile) => {
        const relX = tile.x - centerX;
        const relY = tile.y - centerY;
 
        tile.x = centerX + relY;
        tile.y = centerY - relX;
    })
}
 
function getShape(tetromino) {
    //Get the shape of the tetromino
    const divsTetromino = [];
    switch (tetromino) {
        case "square":
            divsTetromino.push({ x: 0, y: 0 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 0, y: 1 });
            divsTetromino.push({ x: 1, y: 1 });
            break;
        case "L":
            divsTetromino.push({ x: 0, y: 0 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 2, y: 0 });
            divsTetromino.push({ x: 0, y: 1 });
            break;
        case "T":
            divsTetromino.push({ x: 0, y: 0 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 2, y: 0 });
            divsTetromino.push({ x: 1, y: 1 });
            break;
        case "S":
            divsTetromino.push({ x: 0, y: 0 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 1, y: 1 });
            divsTetromino.push({ x: 2, y: 1 });
            break;
        case "I":
            divsTetromino.push({ x: 0, y: 0 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 2, y: 0 });
            divsTetromino.push({ x: 3, y: 0 });
            break;
 
        default:
            break;
    }
    return divsTetromino;
}
 
//TODO: Create the preview for next tetromino
function drawPreviewTetromino() {
    //TODO: Draw the tetromino on the preview div
}
 
const tetrominoList = [
    { name: "square", shape: getShape("square") },
    { name: "L", shape: getShape("L") },
    { name: "T", shape: getShape("T") },
    { name: "S", shape: getShape("S") },
    { name: "I", shape: getShape("I") },
];