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
