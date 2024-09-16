var myGamePiece;
var myObstacles = [];
var myScore;
var keys = {};
var gamePaused = false;

// Add error handling to audio
var backgroundMusic = new Audio();
backgroundMusic.src = "./Media/backgroundMusic.mp3";
backgroundMusic.onerror = function() {
    console.error("Error loading background music.");
};
backgroundMusic.muted = false; // Unmute if autoplay is an issue

var gunshotSound = new Audio();
gunshotSound.src = "./Media/gunshot.mp3";
gunshotSound.onerror = function() {
    console.error("Error loading gunshot sound.");
};

var jumpSound = new Audio();
jumpSound.src = "./Media/jump.mp3";
jumpSound.onerror = function() {
    console.error("Error loading jump sound.");
};

// Add event listeners
document.getElementById("startButton").addEventListener("click", function() {
    startGame();
    backgroundMusic.play().catch(function(error) {
        console.error("Autoplay blocked or error playing background music:", error);
    }); // Try to play background music on game start
});
document.getElementById("pauseButton").addEventListener("click", togglePause);

function startGame() {
    console.log("Game starting...");
    
    // Initialize game piece (character image)
    myGamePiece = new gameObject(30, 30, "./Media/character.png", 10, 120, "image");

    // Initialize score display
    myScore = new gameObject("30px", "Consolas", "black", 280, 40, "text");

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

        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");

        // Load background image with error handling
        var backgroundImage = new Image();
        backgroundImage.src = "./Media/background.jpg";
        backgroundImage.onload = () => {
            console.log("Background image loaded...");
            this.context.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        };
        backgroundImage.onerror = function() {
            console.error("Error loading background image.");
        };

        // Add the canvas element to the DOM
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        console.log("Canvas added to DOM.");

        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20); // Game loop
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
        alert("Game Over! Your Score: " + this.frameNo);
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
        } else if (this.type == "image") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
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
    if (!gamePaused) {
        var x, height, gap, minHeight, maxHeight, minGap, maxGap;

        // Check for collisions
        for (var i = 0; i < myObstacles.length; i++) {
            if (myGamePiece.crashWith(myObstacles[i])) {
                myGameArea.stop();
                return;
            }
        }

        // Clear the canvas
        myGameArea.clear();
        myGameArea.frameNo += 1;

        // Create new obstacles (poles with Media)
        if (myGameArea.frameNo == 1 || everyinterval(150)) {
            x = myGameArea.canvas.width;
            minHeight = 20;
            maxHeight = 200;
            height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
            minGap = 50;
            maxGap = 200;
            gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

            // Add top and bottom pole Media
            myObstacles.push(new gameObject(10, height, "./Media/pole.png", x, 0, "image")); // Top pole
            myObstacles.push(new gameObject(10, myGameArea.canvas.height - height - gap, "./Media/pole.png", x, height + gap, "image")); // Bottom pole
        }

        // Move and update obstacles
        for (var i = 0; i < myObstacles.length; i++) {
            myObstacles[i].x -= 1;
            myObstacles[i].update();
        }

        // Update score
        myScore.text = "SCORE: " + myGameArea.frameNo;
        myScore.update();

        // Update game piece
        myGamePiece.newPos();
        myGamePiece.update();

        // Arrow key controls
        if (keys['ArrowUp']) {
            myGamePiece.speedY = -2; // Move up
            jumpSound.play().catch(function(error) {
                console.error("Jump sound error:", error);
            }); // Play jump sound
        } else if (keys['ArrowDown']) {
            myGamePiece.speedY = 2;  // Move down
        } else {
            myGamePiece.speedY = 0;
        }

        if (keys['ArrowLeft']) {
            myGamePiece.speedX = -2; // Move left
        } else if (keys['ArrowRight']) {
            myGamePiece.speedX = 2;  // Move right
        } else {
            myGamePiece.speedX = 0;
        }
    }
}

function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 === 0;
}

function togglePause() {
    if (!gamePaused) {
        gamePaused = true;
        backgroundMusic.pause(); // Pause the background music
        document.getElementById("pauseButton").textContent = "Resume Game";
    } else {
        gamePaused = false;
        backgroundMusic.play().catch(function(error) {
            console.error("Error resuming background music:", error);
        }); // Resume background music
        document.getElementById("pauseButton").textContent = "Pause Game";
    }
}




