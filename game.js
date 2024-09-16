var myGamePiece;
var myObstacles = [];
var myScore;
var keys = {};
var gamePaused = false;
var backgroundMusic = new Audio("/media/backgroundMusic.mp3"); // Correctly linking background music
var gunshotSound = new Audio("/media/gunshot.mp3"); // Correctly linking gunshot sound
var jumpSound = new Audio("/media/jump.mp3"); // Correctly linking jump sound

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("pauseButton").addEventListener("click", togglePause);

function startGame() {
    // Initialize game piece (character image)
    myGamePiece = new gameObject(30, 30, "/images/character.png", 10, 120, "image");

    // Initialize score display
    myScore = new gameObject("30px", "Consolas", "black", 280, 40, "text");

    // Start game area and background music
    myGameArea.start();
    backgroundMusic.play(); // Start background music

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
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");

        // Draw background image
        var backgroundImage = new Image();
        backgroundImage.src = "images/background.png"; // Linking background image
        backgroundImage.onload = () => {
            this.context.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        };

        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
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
        this.image.src = colorOrImage; // Load the image file
    }

    this.update = function() {
        var ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = colorOrImage;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == "image") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height); // Draw the image
        } else {
            ctx.fillStyle = colorOrImage;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.hitEdges(); // Prevent the object from moving out of the canvas
    }

    this.hitEdges = function() {
        // Restrict the object from moving out of the canvas
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

        // Create new obstacles (poles with images)
        if (myGameArea.frameNo == 1 || everyinterval(150)) {
            x = myGameArea.canvas.width;
            minHeight = 20;
            maxHeight = 200;
            height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
            minGap = 50;
            maxGap = 200;
            gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);

            // Add top and bottom pole images
            myObstacles.push(new gameObject(10, height, "Media/pole.png", x, 0, "image")); // Top pole
            myObstacles.push(new gameObject(10, myGameArea.canvas.height - height - gap, "Media/pole.png", x, height + gap, "image")); // Bottom pole
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
            jumpSound.play(); // Play jump sound
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
        backgroundMusic.play(); // Resume the background music
        document.getElementById("pauseButton").textContent = "Pause Game";
    }
}

}


