(function(){

    var image = new Image();
    var imageData;
    image.addEventListener('load', function() {
        console.dir(image);
        console.log(image.width);
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //console.dir(map);
        //imageData = map.data;
        console.log(getPixel(imageData, 3, 0));
    });

    function getPixel(imageData, x, y) {
        var startIndex_i = x * 4 + y * imageData.width;
        var endIndex_i = startIndex_i + 4;
        var pixel_a = imageData.data.slice(startIndex_i, endIndex_i)
        var pixel_o = {
            r: pixel_a[0],
            g: pixel_a[1],
            b: pixel_a[2],
            a: pixel_a[3]
        };
        return pixel_o;
        // return imageData.slice(startIndex_i, endIndex_i);
        // return imageData.slice(startIndex_i, endIndex_i)
        // return imageData[x * 4 + y * image.width];
    }
    image.src = './img/maze.png';


    var renderer_o = PIXI.autoDetectRenderer({
        transparent: false,
        antialias: true,
        backgroundColor: 0x000000,
        clearBeforeRender: true
    });

    renderer_o.view.style.position = 'absolute';
    renderer_o.view.style.display = 'block';
    renderer_o.autoResize = true;
    //renderer_o.resize(window.innerWidth, window.innerHeight);
    renderer_o.resize(200, 400);
    document.body.appendChild(renderer_o.view);
    var container_o = new PIXI.particles.ParticleContainer(
        100, // Max antal sprites (högst 1500).
    {	
    position: true,
        rotation: true,
        uvs: true, // Måste vara true om en sprite kommer att ändra textur.
        tint: true // Alpha
    });

    var stage_o = new PIXI.Container();

    PIXI.loader.add(['./img/pac-man.json']).load(spriteSetUp);

    var pacMan_o;
    var backgroundContainer_o;
    var maze_o;

    function spriteSetUp() {

        var id = PIXI.loader.resources['./img/pac-man.json'].textures;

        // Load background.
        maze_o = new PIXI.Sprite(id['maze.png']);
        var backgroundDimensions_o = {
            x: 200,
            y: 400
        };
        backgroundContainer_o = background(backgroundDimensions_o, maze_o, 'contain');
        

        pacMan_o = new PIXI.Sprite(id['pac-man-full.png']);
        pacMan_o.x = 100;
        pacMan_o.y = 100;
        container_o.addChild(pacMan_o);
        stage_o.addChild(backgroundContainer_o);
        stage_o.addChild(container_o);
        renderer_o.render(stage_o);
        var imgData = renderer_o.extract.pixels(backgroundContainer_o);
        console.dir(imgData);
        
        // renderer_o.render(container_o);
        //startTicker();
        start_rendering(60);
    }


    
    // function startTicker() {
    //     var ticker = new PIXI.ticker.Ticker();
    //     ticker.stop();
    //     ticker.add(function(deltaTime){
    //         console.log(deltaTime);
    //         pacMan_o.x = pacMan_o.x + 1;
    //         // Gör något här, t ex flytta sprites.
    //         renderer_o.render(container_o);
    //     });
    //     ticker.start();
    // }

    var fps, fps_interval, start_time, now, then, elapsed;


    function start_rendering(fps) {
      fps_interval = 1000 / fps;
      then = Date.now();
      render();
    }

    function render() {
       requestAnimationFrame(render);
       now = Date.now();
       elapsed = now - then;
       if(elapsed > fps_interval) {
           then = now - (elapsed % fps_interval);
           update( elapsed );
       }
    }// Ett spelobjekt.
   
    var speed_x = 0;
    var speed_y = 0;

    function update( elapsed ) {
        var delta = elapsed / 1000;
        pacMan_o.x = pacMan_o.x + speed_x * delta;
        pacMan_o.y = pacMan_o.y + speed_y * delta;
        //renderer_o.render(backgroundContainer_o);
        renderer_o.render(stage_o);
    }
    
    document.addEventListener('keydown', function(e) {
        console.dir(e);
        switch(e.keyCode) {
            case 38: // Up
                var pixel_o = getPixel(imageData, pacMan_o.x, pacMan_o.y - 1);
                if(pixel_o.a === 0) {
                    speed_y = -50;
                } else {
                    speed_y = 0;
                }
                
                break;
            case 40: // Down
                speed_y = 50;
                break;
            case 39: // Right
                speed_x = 50;
                break;
            case 37: // Left
                speed_x = -50;
                break;
        }
        console.log('x: ' + pacMan_o.x);
        console.log('y: ' + pacMan_o.y)
    });

    document.addEventListener('keyup', function(e) {
        console.dir(e);
        speed_x = 0;
        speed_y = 0;
    });

/*
*  PixiJS Background Cover/Contain Script
*   Returns PixiJS Container
*   ARGS:
*   bgSize: Object with x and y representing the width and height of background. Example: {x:1280,y:720}
*   inputSprite: Pixi Sprite containing a loaded image or other asset.  Make sure you preload assets into this sprite.
*   type: String, either "cover" or "contain".
*   forceSize: Optional object containing the width and height of the source sprite, example:  {x:1280,y:720}
*/
function background(bgSize, inputSprite, type, forceSize) {
    var sprite = inputSprite;
    var bgContainer = new PIXI.Container();
    var mask = new PIXI.Graphics().beginFill(0x8bc5ff).drawRect(0,0, bgSize.x, bgSize.y).endFill();
    bgContainer.mask = mask;
    bgContainer.addChild(mask);
    bgContainer.addChild(sprite);

    var sp = {x:sprite.width,y:sprite.height};
    if(forceSize) sp = forceSize;
    var winratio = bgSize.x/bgSize.y;
    var spratio = sp.x/sp.y;
    var scale = 1;
    var pos = new PIXI.Point(0,0);
    if(type == 'cover' ? (winratio > spratio) : (winratio < spratio)) {
        //photo is wider than background
        scale = bgSize.x/sp.x;
        pos.y = -((sp.y*scale)-bgSize.y)/2
    } else {
        //photo is taller than background
        scale = bgSize.y/sp.y;
        pos.x = -((sp.x*scale)-bgSize.x)/2
    }

    sprite.scale = new PIXI.Point(scale,scale);
    sprite.position = pos;

    return bgContainer;
}

}());