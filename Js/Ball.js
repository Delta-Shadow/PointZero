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
