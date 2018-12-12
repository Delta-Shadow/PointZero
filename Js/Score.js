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
