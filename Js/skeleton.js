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
