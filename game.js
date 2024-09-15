var myGamePiece;
var myObstacles = [];
var myScore;
var keys = {};

function startGame() {
    myGamePiece = new gameObject(30, 30, "red", 10, 120);
    character2 = new gameObject(20, 20, "yellow", 20, 150);
    
    myScore = new gameObject("30px", "Consolas", "black", 280, 40, "text");

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

function gameObject(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        var ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
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
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;

    // Check for collisions
    for (var i = 0; i < myObstacles.length; i++) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            return;
        }
    }

    // Clear the canvas
    myGameArea.clear();
    myGameArea.frameNo += 1;

    // Create new obstacles
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new gameObject(10, height, "green", x, 0));
        myObstacles.push(new gameObject(10, x - height - gap, "green", x, height + gap));
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
    character2.update();

    // Arrow key controls
    if (keys['ArrowUp']) {
        myGamePiece.speedY = -2; // Move up
    } else if (keys['ArrowDown']) {
        myGamePiece.speedY = 2;  // Move down
    } else {
        myGamePiece.speedY = 0;  // Stop moving vertically
    }

    if (keys['ArrowLeft']) {
        myGamePiece.speedX = -2; // Move left
    } else if (keys['ArrowRight']) {
        myGamePiece.speedX = 2;  // Move right
    } else {
        myGamePiece.speedX = 0;  // Stop moving horizontally
    }
}

function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 === 0;
}

