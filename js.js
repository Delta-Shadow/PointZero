// requestAnim shim layer by Paul Irish
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

let Game = {
    width: 600, 
    height: 800,
    roller: 0,
    ticker: 0,
    objs: {
        menu: 2,
        gameOver: 2
    },
    mode: "menu",
    bg: "White",
    tapStart: {x: 0, y: 0},
    tapEnd: {x: 0, y: 0}
};

window.addEventListener("resize", OnResizeCalled, false);
window.addEventListener("orientationchange", OnResizeCalled, false);
document.addEventListener("mousedown", clickStart, false); 
document.addEventListener("mouseup", clickEnd, false); 
document.addEventListener("touchstart", touchStart, false); 
document.addEventListener("touchend", touchEnd, false);

function OnResizeCalled() { 
    canvas.style.width = window.innerWidth + 'px'; 
    canvas.style.height = window.innerHeight + 'px';
    
    var gameWidth = window.innerWidth; 
    var gameHeight = window.innerHeight; 
    var scaleToFitX = gameWidth / Game.width; 
    var scaleToFitY = gameHeight / Game.height; 
     
    var currentScreenRatio = gameWidth / gameHeight; 
    var optimalRatio = Math.min(scaleToFitX, scaleToFitY); 
     
    if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) { 
        canvas.style.width = gameWidth + "px"; 
        canvas.style.height = gameHeight + "px"; 
    } 
    else { 
        canvas.style.width = Game.width * optimalRatio + "px"; 
        canvas.style.height = Game.height * optimalRatio + "px"; 
    } 
}

OnResizeCalled();

function clickEnd(e) {
    e.preventDefault();
    if (Game.mode == "menu") {
        title.exit();
        subtitle.exit();
    } else if (Game.mode == "play") {
        Game.tapEnd.x = e.clientX;
        Game.tapEnd.y = e.clientY;
        ball.playerInput(Game.tapStart, Game.tapEnd);
    } else if (Game.mode == "game over") {
        window.location.reload(false);
    }
};
	
function clickStart(e) {
    e.preventDefault();
    if (Game.mode == "play") {
        Game.tapStart.x = e.clientX;
        Game.tapStart.y = e.clientY;
    };
};

function touchEnd(e) {
    e.preventDefault();
    if (Game.mode == "menu") {
        Game.mode = "play";
    } else if (Game.mode == "play") {
        Game.tapEnd.x = e.changedTouches[0].clientX;
        Game.tapEnd.y = e.changedTouches[0].clientY;
        ball.playerInput(Game.tapStart, Game.tapEnd);
    } else if (Game.mode == 2 && gameOverScreen.allReady == true) {
        window.location.reload(false);
    }
};
	
function touchStart(e) {
    e.preventDefault();
    if (Game.mode == "play") {
        Game.tapStart.x = e.changedTouches[0].clientX;
        Game.tapStart.y = e.changedTouches[0].clientY;
    };
};

// All UI related objs...
let title = Title();
let subtitle = Subtitle();
let g_title = g_Title();
let g_subtitle = g_Subtitle();

// All SFX objs...
let sfx = SFX();
let particles = Particles();

// All Game related Objs...
let spikes = Spikes();
let score = Score();
let gem = Gem();
let ball = Ball();

function main() { // Main Game Loop
    Game.roller = requestAnimFrame(main);
    ctx.clearRect(0, 0, Game.width, Game.height);
    Game.ticker++;

    ctx.fillStyle = Game.bg;
    ctx.fillRect(0, 0, Game.width, Game.height);

    // These Objs are visible on all screens
    spikes.run();
    score.run();
    sfx.run();
    particles.run();

    if (Game.mode == "menu") {
        title.run();
        subtitle.run();
    }

    if (Game.mode != "menu") {
        // These objs are for game AND game over screen
        gem.run();
        if (Game.mode == "play") { // These objs are only for game time ONLY
            ball.run();
        }
    }

    if (Game.mode == "game over") {
        g_title.run();
        g_subtitle.run();
    }

};

GSM.registerMe("main", (data) => { // This Section to receive messages from the Universe
    if (data == "Subtitle Exited" || data == "Title Exited") {
        Game.objs.menu--;
        if (Game.objs.menu <= 0) {
            Game.mode = "play";
            gem.init();
        }
    };
    if (data == "Player Dead") {
        Game.mode = "game over";
    }
});

main();
