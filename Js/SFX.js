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
