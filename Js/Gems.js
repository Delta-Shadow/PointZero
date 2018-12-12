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
