var myGamePiece;
var myObstacles = [];
var myScore;
var keys = {};
var gamePaused = false;
var gameSpeed = 1;
var backgroundImage;
var crashSound = new Audio();
var gameOver = false; // New variable to track if the game is over

// Initialize audio objects with error handling
var backgroundMusic = new Audio("./Media/backgroundMusic.mp3");
backgroundMusic.loop = true;
backgroundMusic.muted = false;

crashSound.src = "./Media/crash.mp3";

// Add event listeners for buttons
document.getElementById("startButton").addEventListener("click", function() {
    if (gameOver) {
        resetGame(); // Reset game if it's over
    }
    startGame();
    backgroundMusic.play().catch(function(error) {
        console.error("Autoplay blocked or error playing background music:", error);
    });
});

document.getElementById("pauseButton").addEventListener("click", togglePause);

function startGame() {
    console.log("Game starting...");
    gameOver = false;

    // Initialize game piece (character image)
    myGamePiece = new gameObject(30, 30, "./Media/character.png", 10, 120, "image");

    // Initialize score display (Score retains from previous runs unless resetGame is called)
    if (!myScore) {
        myScore = new gameObject("30px", "Consolas", "black", 280, 40, "text");
    }

    // Start game area
    myGameArea.start();

    // Add event listeners for keydown and keyup
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        console.log("Game area started...");

        this.canvas.width = 500;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");

        // Load background image with error handling
        backgroundImage = new Image();
        backgroundImage.src = "./Media/background.jpg";
        backgroundImage.onload = () => {
            console.log("Background image loaded...");
            this.context.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        };
        backgroundImage.onerror = function() {
            console.error("Error loading background image.");
        };

        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        console.log("Canvas added to DOM.");

        this.frameNo = this.frameNo || 0; // Do not reset frame number unless resetGame is called
        this.interval = setInterval(updateGameArea, 20); // Game loop
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
        alert("Game Over! Your Score: " + this.frameNo);
        gameOver = true;
    },
    adjustSpeed: function() {
        // Increase game speed every 3000 frames
        if (this.frameNo > 3000 && this.frameNo % 3000 === 0) {
            gameSpeed += 0.5;
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

        // Ensure image is ready before drawing
        this.imageReady = false;
        this.image.onload = function() {
            this.imageReady = true;
            console.log("Image loaded.");
        }.bind(this);

        this.image.onerror = function() {
            console.error("Error loading game object image: " + colorOrImage);
        };
    }

    this.update = function() {
        var ctx = myGameArea.context;

        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = colorOrImage;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type === "image" && this.imageReady) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else if (this.type !== "image") {
            ctx.fillStyle = colorOrImage;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.hitEdges();
    }

    this.hitEdges = function() {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > myGameArea.canvas.width - this.width) {
            this.x = myGameArea.canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y > myGameArea.canvas.height - this.height) {
            this.y = myGameArea.canvas.height - this.height;
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
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    if (!gamePaused && !gameOver) {
        var x, height, gap, minHeight, maxHeight, minGap, maxGap;

        myGameArea.clear();

        // Draw the background image first
        myGameArea.context.drawImage(backgroundImage, 0, 0, myGameArea.canvas.width, myGameArea.canvas.height);

        myGameArea.frameNo += 1;

        myGameArea.adjustSpeed();

        // Create new obstacles
        if (myGameArea.frameNo == 1 || everyinterval(150)) {
            x = myGameArea.canvas.width;
            minHeight = 20;
            maxHeight = 200;
            height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
            minGap = 50;
            maxGap = 200;
            gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

            myObstacles.push(new gameObject(10, height, "./Media/pole.png", x, 0, "image")); // Top pole
            myObstacles.push(new gameObject(10, myGameArea.canvas.height - height - gap, "./Media/pole.png", x, height + gap, "image")); // Bottom pole
        }

        for (var i = myObstacles.length - 1; i >= 0; i--) {
            myObstacles[i].x -= 1 * gameSpeed;
            myObstacles[i].update();
            if (myObstacles[i].x + myObstacles[i].width < 0) {
                myObstacles.splice(i, 1);
            }
        }

        // Update character
        if (keys["ArrowUp"]) {
            myGamePiece.speedY = -1 * gameSpeed;
        }
        if (keys["ArrowDown"]) {
            myGamePiece.speedY = 1 * gameSpeed;
        }
        if (keys["ArrowLeft"]) {
            myGamePiece.speedX = -1 * gameSpeed;
        }
        if (keys["ArrowRight"]) {
            myGamePiece.speedX = 1 * gameSpeed;
        }

        myGamePiece.newPos();
        myGamePiece.update();

        // Check collisions
        for (var i = myObstacles.length - 1; i >= 0; i--) {
            if (myGamePiece.crashWith(myObstacles[i])) {
                myGameArea.stop();
                crashSound.play().catch(function(error) {
                    console.error("Error playing crash sound:", error);
                });
                return;
            }
        }

        // Update score
        myScore.text = "Score: " + Math.floor(myGameArea.frameNo / 100);
        myScore.update();
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 === 0) { return true; }
    return false;
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
    myObstacles = [];
    myScore.text = "Score: 0";
    gameSpeed = 1;
    myGameArea.frameNo = 0;
    gameOver = false; // Ensure game over state is reset
}

window.addEventListener('load', function() {
    console.log("Page loaded. Ready to start the game.");
});

