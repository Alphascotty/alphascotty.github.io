var myGamePiece;
var myObstacles = [];
var myScore;
var gamePaused = false;
var frames = ["frame1.png", "frame2.png", "frame3.png"];
var currentFrame = 0;
var frameCount = 0;

// Background image
var backgroundImage = new Image();
backgroundImage.src = "background.jpg"; // Set the path to your background image

function startGame() {
    myGamePiece = new gameObject(30, 30, "character.png", 10, 120);
    character2 = new gameObject(20, 20, "character.png", 20, 150);
    myGamePiece.gravity = 0.05;
    myScore = new gameObject("30px", "Consolas", "black", 280, 40, "text");
    myGameArea.start();
    gamePaused = false;
}

function pauseGame() {
    clearInterval(myGameArea.interval);
    gamePaused = true;
}

function resumeGame() {
    myGameArea.interval = setInterval(updateGameArea, 20);
    gamePaused = false;
}

document.getElementById("startButton").addEventListener('click', function() {
    if (gamePaused) {
        resumeGame();
    } else {
        startGame();
    }
});

document.getElementById("pauseButton").addEventListener('click', function() {
    if (!gamePaused) {
        pauseGame();
    }
});

function playSound(id) {
    var sound = document.getElementById(id);
    sound.play();
}

function accelerate(n) {
    myGamePiece.gravity = n;
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function gameObject(width, height, imgSrc, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = new Image();
    this.image.src = imgSrc;
    this.update = function() {
        var ctx = myGameArea.context;
        if (this.type === "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + this.width;
        var mytop = this.y;
        var mybottom = this.y + this.height;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + otherobj.width;
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + otherobj.height;
        return !(mybottom < othertop || mytop > otherbottom || myright < otherleft || myleft > otherright);
    }
}

function updateGameArea() {
    frameCount++;
    if (frameCount % 10 === 0) {
        currentFrame = (currentFrame + 1) % frames.length;
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            playSound("crashSound");
            return;
        }
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;

    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new gameObject(10, height, "pole.png", x, 0));
        myObstacles.push(new gameObject(10, x - height - gap, "pole.png", x, height + gap));
    }

    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
    character2.update();
}

function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 === 0;
}

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case "ArrowUp":
            myGamePiece.speedY = -2; // Move up
            break;
        case "ArrowDown":
            myGamePiece.speedY = 2; // Move down
            break;
        case "ArrowLeft":
            myGamePiece.speedX = -2; // Move left
            break;
        case "ArrowRight":
            myGamePiece.speedX = 2; // Move right
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
            myGamePiece.speedY = 0; // Stop vertical movement
            break;
        case "ArrowLeft":
        case "ArrowRight":
            myGamePiece.speedX = 0; // Stop horizontal movement
            break;
    }
});

