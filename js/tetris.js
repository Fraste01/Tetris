//Created all the variables to make the game work
let speed = 0, 
    points = 0,
    level = 1,
    tempSpeed = 0,
    currentTetromino = null, //Tetromino object (square, L, etc)
    currentPosition = null,
    moving = true,
    nextTetromino = null,
    pause=false,
    gameOver = false;
 
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

    const divPreview = document.getElementById("previewNextItem");
    
    if (divPreview == null) {
        alert("Error while preparing the game.");
        return;
    }
    for (let i = 0; i < 6; i++) {
        const rowDivPreview = document.createElement("div");
        rowDivPreview.classList.add("rowPreview");
        rowDivPreview.dataset.y = i;
        
        for (let j= 0; j<6; j++) {
            const tileDivPreview = document.createElement("div");
            tileDivPreview.classList.add("emptyTilePreview");
            tileDivPreview.dataset.x = j;
            tileDivPreview.dataset.y = i;
            rowDivPreview.appendChild(tileDivPreview);
        }
        divPreview.appendChild(rowDivPreview);
    }

    //TODO: Create the div for the score + level + next tetromino
 
    //TODO: Create a countdown and start the game
    speed = 1;
    points = 0;
 
    //Create a random tetromino
    currentTetromino = randomTetromino();
    currentPosition = { x: 4, y: 19 };
 
    drawTetromino(currentPosition);
    nextTetromino = randomTetromino();
    drawPreviewTetromino(); //TODO: Create the preview for next tetromino and draw it
 
    setInterval(() => {
        if (gameOver) {
            return;
        }
        if (!pause) {
            moveDown();
        }
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
 
function checkCollision(nextPosition, newShape) {
    //Checking if the tetromino is colliding with something (wall or another tetromino)
    var collision = false;
 
    if (currentTetromino == null || currentTetromino.shape == null) {
        return collision;
    }
 
    if (newShape != null || newShape != undefined) {
        for (let i = 0; i < newShape.length; i++) {
            const tile = newShape[i];
            const positionX = tile.x + nextPosition.x;
            const positionY = tile.y + nextPosition.y;
            const tileDiv = document.querySelector(`[data-x="${positionX}"][data-y="${positionY}"]`);
    
            if (tileDiv != null && !tileDiv.classList.contains("currentTile") && tileDiv.classList.contains("tile")) {
                collision = true;
            }
        }
    } else {
        for (let i = 0; i < currentTetromino.shape.length; i++) {
            const tile = currentTetromino.shape[i];
            const positionX = tile.x + nextPosition.x;
            const positionY = tile.y + nextPosition.y;
            const tileDiv = document.querySelector(`[data-x="${positionX}"][data-y="${positionY}"]`);
    
            if (tileDiv != null && !tileDiv.classList.contains("currentTile") && tileDiv.classList.contains("tile")) {
                collision = true;
            }
        }
    }

    
 
    return collision;
}
 
function handleInput(e) {
    const keyCode = e.keyCode;
    if (currentPosition == null) return;

    //Handle the keyboard input to move the tetromino
    //Default:
    /*
        Key left: move left the tetromino
        Key right: move right the tetromino
        Key down: speed up the falling
        Key up: rotate the tetromino
    */
    //TODO: Add the configuration to change the default keys.
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
        currentTetromino = nextTetromino;
        nextTetromino = randomTetromino();
        drawPreviewTetromino();
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
                                    filter((row) => parseInt(row.childNodes[0].dataset.y) > posY).
                                    sort((a, b) => parseInt(a.childNodes[0].dataset.y) - parseInt(b.childNodes[0].dataset.y));
 
            upperRows.forEach(upperRow => {
                console.log(upperRow);
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
        temp = tetrominoList[Math.floor(Math.random() * tetrominoList.length)]
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
    if (currentTetromino == null || currentTetromino.shape == null) {
        return;
    }
 
    if (currentTetromino.name == 'square') {
        return;
    }

    let newTetrominoShape = [];
    const centerX = currentTetromino.shape[0].x;
    const centerY = currentTetromino.shape[0].y;
    let lowestY = currentTetromino.shape[0].y;

    currentTetromino.shape.forEach((tile) => {
        const relX = tile.x - centerX;
        const relY = tile.y - centerY;
        
        newTetrominoShape.push({ x: centerX + relY, y: centerY - relX });
        if (lowestY > newTetrominoShape[newTetrominoShape.length - 1].y) {
            lowestY = newTetrominoShape[newTetrominoShape.length - 1].y;
        }
    });

    //Check if the new position will go under the ground if yes prevent rotation
    if (currentPosition.y + lowestY < 1) {
        return;
    }

    //TODO: Check left and right border
    for (let i = 0; i < newTetrominoShape.length; i++) {
        if (newTetrominoShape.x + currentPosition.x <= 0) {
            return;
        }
        if (newTetrominoShape.x + currentPosition.x >= 9) {
            return;
        }
    }


    //TODO: Optimize this
    if (!checkCollision(currentPosition, newTetrominoShape)) {
        currentTetromino.shape.forEach((tile) => {
            const relX = tile.x - centerX;
            const relY = tile.y - centerY;
    
            tile.x = centerX + relY;
            tile.y = centerY - relX;
        })
    }
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
        case "Z":
            divsTetromino.push({ x: 0, y: 1 });
            divsTetromino.push({ x: 1, y: 1 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 2, y: 0 });
            break;
        case "U":
            divsTetromino.push({ x: 0, y: 0 });
            divsTetromino.push({ x: 0, y: 1 });
            divsTetromino.push({ x: 1, y: 0 });
            divsTetromino.push({ x: 2, y: 0 });
            divsTetromino.push({ x: 2, y: 1 });
            break;
        default:
            break;
    }
    return divsTetromino;
}
 
//TODO: Create the preview for next tetromino
function drawPreviewTetromino() {
    //TODO: Draw the tetromino on the preview div
    if (nextTetromino == null || nextTetromino == undefined) return;

    document.querySelectorAll("div.tilePreview").forEach((tile) => {
        tile.classList.remove("tilePreview");
        tile.classList.add("emptyTilePreview");
    })

    const divPreview = document.getElementById("previewNextItem");
    
    const shape = nextTetromino.shape;

    shape.forEach((tile) => {
        const tileDiv = document.querySelector(`#previewNextItem [data-x="${tile.x}"][data-y="${tile.y}"]`);
        if (tileDiv != null) {
            tileDiv.classList.remove("emptyTilePreview");
            tileDiv.classList.add("tilePreview");    
        }
    })
}

//TODO: Create the game over and stop the game
function stopGame() {
    //TODO: Stop the game
    gameOver = true;
}

//TODO: Create the pause function
function Pause() {
    this.pause = !this.pause;
}
 
//TODO: Add Z tetromino and U tetromino
const tetrominoList = [
    { name: "square", shape: getShape("square") },
    { name: "L", shape: getShape("L") },
    { name: "T", shape: getShape("T") },
    { name: "S", shape: getShape("S") },
    { name: "I", shape: getShape("I") },
    { name: "Z", shape: getShape("Z") },
    { name: "U", shape: getShape("U") }
];