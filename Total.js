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
let Ball = (() => {
    
    GSM.registerMe("ball", (data) => {
        // This section for receiving messages from the Universe
        console.log(data);
    });

    // Properties
        let x = 275;
	let y = 700;
	let r = 25;
	let color = "#7a306c";
	let v = {x: 0, y: -12};
	let g = {x: 0, y: 0.2};
        let ticker = 0; // For controlling particles
        // Description of Animations for this obj
        let anime = {
            queue: [],
            list: {
                normal: {
                    update: () => {},
                    draw: () => {
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(x, y, r, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.fill();
                    }
                } 
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }

        // Updating Mechanics...
	if (x < 45 || x > 555 || y < 45 || y > 755) {
            // Collided with Spikes
            GSM.postMsg("main", "Player Dead");
            GSM.postMsg("sfx", {name: "shake", intensity: 10});
            GSM.postMsg("particles", {name: "particle", type: "explosion", x: x, y: y});
        } else {
            // Updating normal Physics
            v.x += g.x;
            v.y += g.y;
            x += v.x;
            y += v.y;
        }

        // Sending Ball's Coords to Gems so it can check for collision
        GSM.postMsg("gem", {name: "Player Coords", x: x, y: y});
        // Producing Trail Particles
        if (ticker % 10 == 0) {
            GSM.postMsg("particles", {name: "particle", type: "trail", x: x, y: y, v: {x: -v.x, y: -v.y}, g: {x: 0, y: 0}});
        }
        ticker++;
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    let playerInput = (tapStart, tapEnd) => {
        let dragDistX = (tapEnd.x - tapStart.x);
        let dragDistY = (tapEnd.y - tapStart.y);
        if ( Math.abs(dragDistX) > Math.abs(dragDistY) ) { // Drag in X Plane
            g.y = 0;
            v.x *= 0.3;
            if (dragDistX > 0) { // Dragged Right
                g.x = 0.1;
            } else if (dragDistX < 0) { // Dragged Left
                g.x = -0.1;
            }
        } else if ( Math.abs(dragDistX) < Math.abs(dragDistY) ) { // Drag in Y Plane
            g.x = 0;
            v.y *= 0.3;
            if (dragDistY > 0) { // Dragged Down
                g.y = 0.1;
            } else if (dragDistY < 0) { // Dragged Up
                g.y = -0.1;
            }
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime,
        playerInput: playerInput
    }

});
let g_Title = (() => {
    
    GSM.registerMe("g_Title", (data) => {
        // This section for receiving messages from the Universe
    });

    // Properties
        let font = "80px Arial";
        let opacity = 1;
        let color = "rgba(0, 0, 0, " + opacity + ")";
        let x = 90; let y = 265;
        // Description of Animations for this obj
        let anime = {
            queue: ["intro"],
            list: {
                normal: {
                    update: () => {},
                    draw: () => { drawingText(); }
                }, 
                intro: {
                    update: () => { o += 0.02; color = "rgba(0, 0, 0, " + o + ")" },
                    draw: () => { drawingText() },
                    isOver: () => { if (this.o >= 1) {return true} },
                    init: () => { this.o = 0 },
                    destructor: () => {},
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    let drawingText = () => {
        ctx.fillStyle = color; ctx.font = font; ctx.fillText("Game Over", x, y); 
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime
    }

});

let g_Subtitle = (() => {
    
    GSM.registerMe("g_Subtitle", (data) => {
        // This section for receiving messages from the Universe
    });

    // Properties
        let font = "30px Arial";
        let opacity = 1;
        let color = "rgba(0, 0, 0, " + opacity + ")";
        let x = 190; let y = 680; let opacityV = 0.02;
        // Description of Animations for this obj
        let anime = {
            queue: ["intro"],
            list: {
                normal: {
                    update: () => {
                        if (opacity < 0) {
                            opacityV = 0.02;
                        } else if (opacity > 1) {
                            opacityV = -0.02;
                        }
                        opacity += opacityV;
                        color = "rgba(0, 0, 0, " + opacity + ")";
                    },
                    draw: () => { drawingText(); }
                }, 
                intro: {
                    update: () => { o += 0.02; color = "rgba(0, 0, 0, " + o + ")" },
                    draw: () => { drawingText() },
                    isOver: () => { if (this.o >= 1) {return true} },
                    init: () => { this.o = 0 },
                    destructor: () => {},
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    let drawingText = () => {
        ctx.fillStyle = color; ctx.font = font; ctx.fillText("Tap to Continue !", x, y); 
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime
    }

});
let Gem = (() => {

    GSM.registerMe("gem", (data) => {
        // This section for receiving messages from the Universe
        if (data.name == "Player Coords") {
            ballX = data.x;
            ballY = data.y;
        }
        if (data.name == "Spawn Request") {
            spawn(data.x, data.y);
        }
    });

    // Properties
        let x = 0; let y = 0; // These coords act as the center of the gem
        let w = 0; let h = 0; // Used for Animation
        let width = 25; let height = 25;
        let color = "Green";
        let trash = 0;
        let ballX = 0; let ballY = 0;
        // Description of Animations for this obj
        let anime = {
            queue: ["intro"],
            list: {
                normal: {
                    update: () => {
                        w = (5 * (Math.cos(trash))) / 2 + 22;
                        h = (5 * (Math.sin(trash))) / 2 + 22;
                        trash += 0.7;
                    },
                    draw: () => {
                        ctx.fillStyle = color;
                        ctx.fillRect(x-(w/2), y-(h/2), w, h);
                    }
                }, 
                intro: {
                    update: () => { w += 2; h += 2 },
                    draw: () => {
                        ctx.fillStyle = color;
                        ctx.fillRect(x-(w/2), y-(h/2), w, h);
                    },
                    isOver: () => { if (w >= width) {return true} },
                    init: () => { w = 0; h = 0 },
                    destructor: () => {},
                    shouldStart: () => {}, 
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }

        // Updating Mechanics...
        if (isCollidingWith(ballX, ballY)) {
            GSM.postMsg("sfx", {name: "radial", posX: x, posY: y, type: "outward"} );
            GSM.postMsg("score", "Increment Score");
            spawn();
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    let isCollidingWith = (px, py) => {
        if ( (x+width) >= px && x <= (px+50) && (y+height) >= py && y <= (py+50) ) { // 50 is diameter/width of ball
            return true;
	} else {
            return false;
	}		  
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    let spawn = () => {
        x = Math.floor(Math.random()*400) + 100;
	y = Math.floor(Math.random()*600) + 100;
        GSM.postMsg("sfx", {name: "radial", posX: x, posY: y, type: "inward"} );
    }

    return {
        run: run,
        triggerAnime: triggerAnime,
        isCollidingWith: isCollidingWith,
        init: spawn
    }

});
var GSM = (function() {

    var m_subscribers = {}

    var m_registerMe = function(uid, callback) {
        m_subscribers[uid] = callback
    }

    var m_postMsg = function(uid, msg) {
        m_subscribers[uid](msg)
    }

    return {
        registerMe: m_registerMe,
        postMsg: m_postMsg
    }

})()
let Title = (() => {
    
    GSM.registerMe("Title", (data) => {
        // This section for receiving messages from the Universe
        if (data == "Exit") {
            triggerAnime("outro");
        }
    });

    // Properties
        let font = "90px Arial";
        let opacity = 1;
        let color = "rgba(0, 0, 0, " + opacity + ")";
        let x = 100; let y = 265;
        // Description of Animations for this obj
        let anime = {
            queue: ["intro"],
            list: {
                normal: {
                    update: () => {},
                    draw: () => { drawingText(); }
                }, 
                intro: {
                    update: () => { o += 0.02; color = "rgba(0, 0, 0, " + o + ")" },
                    draw: () => { drawingText() },
                    isOver: () => { if (this.o >= 1) {return true} },
                    init: () => { this.o = 0 },
                    destructor: () => {},
                    timesTriggered: 0, 
                    timesRan: 0,
                },
                outro: {
                    update: () => { o -= 0.02; color = "rgba(0, 0, 0, " + o + ")" },
                    draw: () => { drawingText() },
                    isOver: () => { if (this.o <= 0) {return true} },
                    init: () => { this.o = opacity },
                    destructor: () => { GSM.postMsg("main", "Title Exited") },
                    timesTriggered: 0, 
                    timesRan: 0,
                }

            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    let drawingText = () => {
        ctx.fillStyle = color; ctx.font = font; ctx.fillText("Point Zero", x, y); 
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    let exit = () => {
        triggerAnime("outro");
    }

    return {
        run: run,
        triggerAnime: triggerAnime,
        exit: exit
    }

});

let Subtitle = (() => {
    
    GSM.registerMe("Subtitle", (data) => {
        // This section for receiving messages from the Universe
        if (data == "Exit") {
            triggerAnime("outro");
        }
    });

    // Properties
        let font = "30px Arial";
        let opacity = 1;
        let color = "rgba(0, 0, 0, " + opacity + ")";
        let x = 220; let y = 680; let opacityV = 0.02;
        // Description of Animations for this obj
        let anime = {
            queue: ["intro"],
            list: {
                normal: {
                    update: () => {
                        if (opacity < 0) {
                            opacityV = 0.02;
                        } else if (opacity > 1) {
                            opacityV = -0.02;
                        }
                        opacity += opacityV;
                        color = "rgba(0, 0, 0, " + opacity + ")";
                    },
                    draw: () => { drawingText(); }
                }, 
                intro: {
                    update: () => { o += 0.02; color = "rgba(0, 0, 0, " + o + ")" },
                    draw: () => { drawingText() },
                    isOver: () => { if (this.o >= 1) {return true} },
                    init: () => { this.o = 0 },
                    destructor: () => {},
                    timesTriggered: 0, 
                    timesRan: 0,
                },
                outro: {
                    update: () => { o -= 0.02; color = "rgba(0, 0, 0, " + o + ")" },
                    draw: () => { drawingText() },
                    isOver: () => { if (this.o <= 0) {return true} },
                    init: () => { this.o = opacity },
                    destructor: () => { GSM.postMsg("main", "Subtitle Exited") },
                    timesTriggered: 0, 
                    timesRan: 0,
                }

            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    let drawingText = () => {
        ctx.fillStyle = color; ctx.font = font; ctx.fillText("Tap to Play !", x, y); 
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    let exit = () => {
        triggerAnime("outro");
    }

    return {
        run: run,
        triggerAnime: triggerAnime,
        exit: exit
    }

});
let Score = (() => {
    
    GSM.registerMe("score", (data) => {
        // This section for receiving messages from the Universe
        if (data == "Increment Score") {
            increment();
        }
    });

    // Properties
        let score = 0;

    // All Private Methods
    let draw = () => {
        ctx.fillStyle = "#81f495";
        ctx.fillRect(220, 320, 160, 160);
        ctx.font = "100px Arial";
        ctx.fillStyle = "White";
        if (score < 10) {
                ctx.fillText("0" + score, 245, 440);	
        } else {
                ctx.fillText("" + score, 245, 440);
        }
    }

    // All Public Methods
    let run = () => {
        draw();
    }

    let increment = () => {score++}

    return {
        run: run
    }

});
let SFX = (() => {
    
    GSM.registerMe("sfx", (data) => {
        // This section for receiving messages from the Universe
        if (data.name == "shake") {
            queue.push(Shaker(data.intensity));
        }
        if (data.name == "radial") {
            queue.push(Radial(data.posX, data.posY, data.type));
        }
    });

    let queue = [];

    let run = () => {
        for (let i = 0; i < queue.length; i++) {
            if (!queue[i].isComplete()) {
                queue[i].run();
            } else {
                queue.splice(i, 1);
                i--;
            }
        }
    }

    return {
        run: run
    }
});

let Shaker = ((intensityVal) => {

    // Properties
        let intensity = intensityVal;
        let completed = false;
        // Description of Animations for this obj
        let anime = {
            queue: ["shake"],
            list: {
                normal: {
                    update: () => {},
                    draw: () => {}
                }, 
                shake: {
                    update: () => {},
                    draw: () => {},
                    isOver: () => { if (this.trash == 1) {return true} else {this.trash++; return false} },
                    init: () => {
                        ctx.save();
                        this.x = Math.floor(Math.random() * intensity) + 1;
                        this.y = Math.floor(Math.random() * intensity) + 1;
                        ctx.translate(x, y);
                        this.trash = 0;
                    },
                    destructor: () => { ctx.restore(); completed = true },
                    shouldStart: () => {}, 
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime,
        isComplete: () => {return completed}
    }

});

let Radial = (m_x, m_y, m_type) => {

    // Properties
        let completed = false;
        let type = m_type;
        let radius = 80;
        let r = 0; // Used for Animation
        let lineW = 10;
        let lw = 0; // Used for Animation
        let color = "#f21b3f";
        let x = m_x; let y = m_y;
        // Description of Animations for this obj
        let anime = {
            queue: [type],
            list: {
                normal: {
                    update: () => {},
                    draw: () => {}
                }, 
                inward: {
                    update: () => { r -= 10; lw++ },
                    draw: () => { drawingRadial(lw, r) },
                    isOver: () => { 
                        if (r <= 0) {return true};
                    },
                    init: () => { r = radius; lw = 0 },
                    destructor: () => { completed = true },
                    shouldStart: () => {}, 
                    timesTriggered: 0, 
                    timesRan: 0,
                },
                outward: {
                    update: () => { r += 10; lw-- },
                    draw: () => { drawingRadial(lw, r) },
                    isOver: () => { 
                        if (r >= radius && lw <= 0) {return true} 
                    },
                    init: () => {r = 0; lw = lineW},
                    destructor: () => { completed = true },
                    shouldStart: () => {}, 
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    let drawingRadial = (w, r) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI);
        ctx.closePath();
        ctx.stroke(); 
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime,
        isComplete: () => { return completed }
    }

};

// Particle System does not come under the general VFX system
let Particles = () => {

    GSM.registerMe("particles", (data) => {
        if (data.name == "particle") {
            spawn(data.type, data.x, data.y, data.v, data.g);
        }
    });

    let listOfParticles = [];

    let spawn = (type, x, y, v, g) => { // v and g are not required for Explosion type Particles
        if (type == "trail") {
            listOfParticles.push(Particle("trail", x, y, {x: v.x, y: v.y}, {x: 0, y: 0})); // g.x = 0 and g.y = 0 for Trail type Particles
        }
        if (type == "explosion") {
            for (var i = 0; i <= 20; i++) {
                listOfParticles.push(Particle(
                    "explosion", 
                    x, 
                    y, 
                    {x: Math.floor(Math.random()*5)-3, y: -(Math.floor(Math.random()*12)+4)}, 
                    {x: 0, y: 0.2}
                ));
            };
        }
    }

    let run = () => {
        for (let i in listOfParticles) {
            if (!listOfParticles[i].shouldBeKilled()) {
                listOfParticles[i].run();
            } else {
                listOfParticles.splice(i, 1);
                i--;
            }
        }
    }

    return {
        run: run
    }

}

let Particle = (m_type, m_x, m_y, m_v, m_g) => {
    let type = m_type;
    let x = m_x; let y = m_y; let v = m_v; let g = m_g;
    let countDownToDeath = 30; // This is no. of frames after which to kill a Trail type Particle
    let counter = 0;
    let w = 12; let h = 12;
    let color = "#7a306c";

    let update = () => {
        v.x += g.x;
        v.y += g.y;
        x += v.x;
        y += v.y;
        counter++;
    }

    let draw = () => {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
    }

    let isOutOfScreen = () => {
        if (this.x < -20 || this.x > 620 || this.y > 820 || this.y < -200) {
            return true;
	} else {
            return false;
	}
    }

    let shouldBeKilled = () => {
        if (type == "trail") { // Death of Trail type Particles is time bound
            if (counter >= countDownToDeath) { return true };
        } else if (type == "explosion") { // Death of Explosion type Particles is position bound
            return isOutOfScreen();
        }
        return false;
    }

    let run = () => {
        update();
        draw();
    }

    return {
        run: run,
        shouldBeKilled: shouldBeKilled
    }

}
let _Name = (() => {
    
    GSM.registerMe("_Name", (data) => {
        // This section for receiving messages from the Universe
        console.log(data);
    });

    // Properties
        // Description of Animations for this obj
        let anime = {
            queue: [],
            list: {
                normal: {
                    update: () => {},
                    draw: () => {}
                }, 
                intro: {
                    update: () => {},
                    draw: () => {},
                    isOver: () => {},
                    init: () => {},
                    destructor: () => {},
                    shouldStart: () => {}, 
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation...
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                foo.destructor();
                anime.queue.splice(0, 1);
            }
        }

        // Updating Mechanics...
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime
    }

});
let Spikes = (() => {
    
    GSM.registerMe("spikes", (data) => {
        // This section for receiving messages from the Universe
        console.log(data);
    });

    // Properties
        let spikeW = 40; let spikeH = 40; let gap = 40; let color = "rgb(80, 70, 60)";
        // Description of Animations for this obj
        let anime = {
            queue: ["intro"],
            list: {
                normal: {
                    update: () => {},
                    draw: () => { drawingSpikes(spikeH) }
                }, 
                intro: {
                    update: () => { if (h <= spikeH) {h++} },
                    draw: () => { drawingSpikes(h) },
                    isOver: () => { if (this.h >= spikeH) {return true} },
                    init: () => {this.h = 0},
                    shouldStart: () => {}, 
                    timesTriggered: 0, 
                    timesRan: 0,
                }
            }
        }

    // All Private Methods
    let update = () => {
        // Updating Animation
        if (anime.queue.length == 0) {
            anime.list.normal.update();
        } else {
            let foo = anime.list[ anime.queue[0] ];
            if (foo.timesTriggered == foo.timesRan) { foo.timesTriggered++; foo.init() } // This animation is being called freshly
            if (!foo.isOver()) {
                foo.update();
            } else {
                foo.timesRan++;
                anime.queue.splice(0, 1);
            }
        }
    }

    let draw = () => {
        if (anime.queue.length == 0) {
            anime.list.normal.draw();
        } else {
            anime.list[ anime.queue[0] ].draw();
        }
    }

    // Drawing Logic...
    let drawingSpikes = (height) => {
        ctx.fillStyle = color; ctx.beginPath(); upSide(height); downSide(height); leftSide(height); rightSide(height); ctx.closePath(); ctx.fill();
    }

    let upSide = (height) => {
        for (let i = gap; i < 600; i += spikeW + gap) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i + spikeW, 0);
            ctx.lineTo(i + spikeW/2, height);
            ctx.lineTo(i, 0);
        }
    } 
    let downSide = (height) => {
       for (let i = gap; i < 600; i += spikeW + gap) {
            ctx.moveTo(i, 800);
            ctx.lineTo(i + spikeW, 800);
            ctx.lineTo(i + spikeW/2, 800 - height);
            ctx.lineTo(i, 800);
        } 
    } 
    let leftSide = (height) => {
        for (let i = gap; i < 800; i += spikeH + gap) {
            ctx.moveTo(0, i);
            ctx.lineTo(0, i + spikeW);
            ctx.lineTo(height, i + spikeW/2);
            ctx.lineTo(0, i);
        }
    } 
    let rightSide = (height) => {
        for (let i = gap; i < 800; i += spikeH + gap) {
            ctx.moveTo(600, i);
            ctx.lineTo(600, i + spikeW);
            ctx.lineTo(600 - height, i + spikeW/2);
            ctx.lineTo(600, i);
        }
    } 

    // All Public Methods
    let run = () => {
        update();
        draw();
    }

    let triggerAnime = (name) => {
        if (anime.list.hasOwnProperty(name)) {
            anime.queue.push(name);
        }
    }

    return {
        run: run,
        triggerAnime: triggerAnime
    }

});
