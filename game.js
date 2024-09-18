var myGamePiece;
var myObstacles = [];
var myScore;
var keys = {};
var gamePaused = false;
var gameSpeed = 1;
var backgroundImage;
var crashSound = new Audio();
var gameOver = false;

// Initialize audio objects
var backgroundMusic = new Audio("./Media/backgroundMusic.mp3");
backgroundMusic.loop = true;
backgroundMusic.muted = false;
crashSound.src = "./Media/crash.mp3";

// Add event listeners for buttons
document.getElementById("startButton").addEventListener("click", function () {
    if (gameOver) {
        resetGame();
    }
    startGame();
    backgroundMusic.play().catch(function (error) {
        console.error("Autoplay blocked or error playing background music:", error);
    });
});

document.getElementById("pauseButton").addEventListener("click", togglePause);

function startGame() {
    console.log("Game starting...");
    gameOver = false;

    // Increase game piece size by 10
    myGamePiece = new gameObject(40, 40, "./Media/character.png", 10, 120, "image");

    if (!myScore) {
        myScore = new gameObject("30px", "Consolas", "black", 280, 40, "text");
    }

    myGameArea.start();

    window.addEventListener('keydown', function (e) {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', function (e) {
        keys[e.key] = false;
    });
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 500;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");

        backgroundImage = new Image();
        backgroundImage.src = "./Media/background.jpg";
        backgroundImage.onload = () => console.log("Background image loaded.");
        backgroundImage.onerror = function () {
            console.error("Error loading background image.");
        };

        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = this.frameNo || 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
        alert("Game Over! Your Score: " + Math.floor(this.frameNo / 100));
        gameOver = true;
    },
    adjustSpeed: function () {
        // Double the speed every time the score reaches a new 100 interval
        var score = Math.floor(this.frameNo / 100);
        if (score > 0 && score % 2 === 0) {
            gameSpeed = Math.pow(2, score / 2);  // Double the speed each 100 points
            console.log("Game speed increased to:", gameSpeed);
        }
    }
}

function gameObject(width, height, colorOrImage, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;

    if (type === "image") {
        this.image = new Image();
        this.image.src = colorOrImage;
        this.imageReady = false;
        this.image.onload = function () {
            this.imageReady = true;
            console.log("Image loaded.");
        }.bind(this);

        this.image.onerror = function () {
            console.error("Error loading game object image: " + colorOrImage);
        };
    }

    this.update = function () {
        var ctx = myGameArea.context;

        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = colorOrImage;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type === "image" && this.imageReady) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = colorOrImage;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.newPos = function () {
        this.x += this.speedX;
        this.y += this.speedY;
        this.hitEdges();
    }

    this.hitEdges = function () {
        if (this.x < 0) this.x = 0;
        if (this.x > myGameArea.canvas.width - this.width) this.x = myGameArea.canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > myGameArea.canvas.height - this.height) this.y = myGameArea.canvas.height - this.height;
    }

    this.crashWith = function (otherobj) {
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
    if (!gamePaused && !gameOver) {
        myGameArea.clear();

        if (backgroundImage) {
            myGameArea.context.drawImage(backgroundImage, 0, 0, myGameArea.canvas.width, myGameArea.canvas.height);
        }

        myGameArea.frameNo += 1;
        myGameArea.adjustSpeed();

        if (myGameArea.frameNo == 1 || everyinterval(150)) {
            var x = myGameArea.canvas.width;
            var minHeight = 20;
            var maxHeight = 200;
            var height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
            var minGap = 50;
            var maxGap = 200;
            var gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

            myObstacles.push(new gameObject(10, height, "./Media/pole.png", x, 0, "image"));
            myObstacles.push(new gameObject(10, myGameArea.canvas.height - height - gap, "./Media/pole.png", x, height + gap, "image"));
        }

        for (var i = myObstacles.length - 1; i >= 0; i--) {
            myObstacles[i].x -= 1 * gameSpeed;
            myObstacles[i].update();
            if (myObstacles[i].x + myObstacles[i].width < 0) {
                myObstacles.splice(i, 1);
            }
        }

        myGamePiece.speedX = 0;
        myGamePiece.speedY = 0;
        if (keys["ArrowUp"]) myGamePiece.speedY = -1 * gameSpeed;
        if (keys["ArrowDown"]) myGamePiece.speedY = 1 * gameSpeed;
        if (keys["ArrowLeft"]) myGamePiece.speedX = -1 * gameSpeed;
        if (keys["ArrowRight"]) myGamePiece.speedX = 1 * gameSpeed;

        myGamePiece.newPos();
        myGamePiece.update();

        for (var i = myObstacles.length - 1; i >= 0; i--) {
            if (myGamePiece.crashWith(myObstacles[i])) {
                myGameArea.stop();
                crashSound.play().catch(function (error) {
                    console.error("Error playing crash sound:", error);
                });
                return;
            }
        }

        myScore.text = "Score: " + Math.floor(myGameArea.frameNo / 100);
        myScore.update();
    }
}

function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 === 0;
}

function togglePause() {
    if (gamePaused) {
        myGameArea.interval = setInterval(updateGameArea, 20);
        gamePaused = false;
        document.getElementById("pauseButton").innerText = "Pause";
    } else {
        clearInterval(myGameArea.interval);
        gamePaused = true;
        document.getElementById("pauseButton").innerText = "Resume";
    }
}

function resetGame() {
    console.log("Resetting game...");
    clearInterval(myGameArea.interval);
    myObstacles = [];
    myScore.text = "Score: 0";
    gameSpeed = 1;
    myGameArea.frameNo = 0;
    gameOver = false;
}

window.addEventListener('load', function () {
    console.log("Page loaded. Ready to start the game.");
});


