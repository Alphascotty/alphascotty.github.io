var myGamePiece;
var myObstacles = [];
var myScore;
var gamePaused = false;
var backgroundMusic = document.getElementById("backgroundMusic");
var crashSound = document.getElementById("crashSound");

function startGame() {
    // Add CSS styles dynamically
    var canvas = document.getElementById('gameCanvas');
    canvas.style.border = '1px solid #d3d3d3';
    canvas.style.backgroundImage = 'url("background.png")'; // Background image path
    canvas.style.backgroundSize = 'cover';

    backgroundMusic.play();
    myGamePiece = new component(30, 30, "character.png", 10, 120, "image"); // Character image path
    myGamePiece.gravity = 0.025;  // Gravity is now half the original rate
    myScore = new component("30px", "Consolas", "black", 280, 40, "text");
    myGameArea.start();
}

var myGameArea = {
    canvas: document.getElementById('gameCanvas'),
    start: function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
        backgroundMusic.pause();
        crashSound.play();
    },
    pause: function() {
        if (!gamePaused) {
            clearInterval(this.interval);
            backgroundMusic.pause();
        } else {
            this.interval = setInterval(updateGameArea, 20);
            backgroundMusic.play();
        }
        gamePaused = !gamePaused;
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == "image") {
            const img = new Image();
            img.src = color;
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
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
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGameArea.stop();
            return;
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "pole.png", x, 0, "image")); // Pole image path
        myObstacles.push(new component(10, x - height - gap, "pole.png", x, height + gap, "image")); // Pole image path
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    
    // Desktop controls using arrow keys
    if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -1; } // Left arrow
    if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = 1; }  // Right arrow
    if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.speedY = -1; } // Up arrow
    if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.speedY = 1; }  // Down arrow
    
    // Update position
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function pauseGame() {
    myGameArea.pause();
}
