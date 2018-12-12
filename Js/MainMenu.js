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
