(function(){

    var image = new Image();
    var imageData;
    var speedX_i = 0;
    var speedY_i = 0;
    var pixel_o;
    var direction_s = 'none';
    var pacManAnimationFrame_s = 'full';
    var pacMan_o;
    var id;
    var currentFrame_s;
    var changeFrame_i = 0;

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
        //console.log(getPixel(imageData, 3, 0));

        // for(var x = 3, y = 1, i = 0; i < 1; i++) {
        //     console.log('x: ' + x + ' y: ' + y);
        //     var startIndex_i = x * 4 + y * imageData.width * 4;
        //     console.log('startindex: ' + startIndex_i);
        //     var endIndex_i = startIndex_i + 4;
        //     console.log(imageData.data.slice(startIndex_i, endIndex_i));
        //     x++;
        // }

       
    });

    function getPixel(imageData, x, y) {
        x = Math.round(x);
        y = Math.round(y);
        var startIndex_i = x * 4 + y * imageData.width * 4;
        var endIndex_i = startIndex_i + 4;
        var pixel_a = imageData.data.slice(startIndex_i, endIndex_i);
        var pixel_o = {
            r: pixel_a[0],
            g: pixel_a[1],
            b: pixel_a[2],
            a: pixel_a[3]
        };
        return pixel_o;
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

    
    var backgroundContainer_o;
    var maze_o;
    var rectangle = new PIXI.Graphics();
    

    
    function spriteSetUp() {

        id = PIXI.loader.resources['./img/pac-man.json'].textures;

        // Load background.
        maze_o = new PIXI.Sprite(id['maze.png']);
        var backgroundDimensions_o = {
            x: 164,
            y: 212
        };
        backgroundContainer_o = background(backgroundDimensions_o, maze_o, 'contain');
        

        pacMan_o = new PIXI.Sprite(id['pac-man-full.png']);
        pacMan_o.x = 100;
        pacMan_o.y = 200;
        rectangle.beginFill(0xFFFFFF);
        rectangle.drawRect(pacMan_o.x, pacMan_o.y, 2, 2);
        rectangle.endFill();
        container_o.addChild(pacMan_o);
        stage_o.addChild(backgroundContainer_o);
        stage_o.addChild(container_o);
        stage_o.addChild(rectangle);
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
   
    

    function update( elapsed ) {
        var delta = elapsed / 1000;
        var nextX_i = pacMan_o.x + speedX_i * delta;
        var nextY_i = pacMan_o.y + speedY_i * delta;
        // document.getElementById('pac-man-x').innerHTML = pacMan_o.x;
        // document.getElementById('pac-man-y').innerHTML = pacMan_o.y;
        // document.getElementById('speedX_i').innerHTML = speedX_i;
        // document.getElementById('speedY_i').innerHTML = speedY_i;
        // document.getElementById('delta').innerHTML = delta;
        // document.getElementById('sum').innerHTML = changeFrame_i;
        //console.log('nextX_i: ' + nextX_i);
        //console.log('nextY_i: ' + nextY_i);
        // Depending on which direction Pac-Man is going, we must collision check
        // the direction.
        var pixel_o;
        var pixelsAlpha_a = [];
        //var movePacMan_b = true;
        var numOfBlockingPixelsOnLeftHandSide_i = 0;
        var numOfBlockingPixelsOnRightHandSide_i = 0;
        var numOfBlockingPixelsOnUpHandSide_i = 0;
        var numOfBlockingPixelsOnDownHandSide_i = 0;
        var numOfEmptyPixelsFromTop_i = null;
        var x, y;
        switch(direction_s) {
            case 'up':
                for(x = 0; x < 12; x++) {
                    pixel_o = getPixel(imageData, pacMan_o.x + x, pacMan_o.y);
                    if(x < 6) {
                        if(pixel_o.a !== 0) {
                            numOfBlockingPixelsOnLeftHandSide_i++;
                        }
                    } else {
                        if(pixel_o.a !== 0) {
                            numOfBlockingPixelsOnRightHandSide_i++;
                        }
                    }
                }
                if(numOfBlockingPixelsOnLeftHandSide_i || numOfBlockingPixelsOnRightHandSide_i) {
                    if(numOfBlockingPixelsOnLeftHandSide_i + numOfBlockingPixelsOnRightHandSide_i < 12) {
                        if(numOfBlockingPixelsOnLeftHandSide_i < numOfBlockingPixelsOnRightHandSide_i) {
                            pixel_o = getPixel(imageData, pacMan_o.x - 1, pacMan_o.y + 5);
                            if(pixel_o.a === 0) {
                                pacMan_o.x--;
                            }
                        } else {
                            pixel_o = getPixel(imageData, pacMan_o.x + 12, pacMan_o.y + 5);
                            if(pixel_o.a === 0) {
                                pacMan_o.x++;
                            }
                        }
                    }
                } else {
                    pacMan_o.y--;
                }
                break;
            case 'down':
                for(var x = 0; x < 12; x++) {
                    pixel_o = getPixel(imageData, pacMan_o.x + x, pacMan_o.y + 12);
                    if(x < 6) {
                        if(pixel_o.a !== 0) {
                            numOfBlockingPixelsOnLeftHandSide_i++;
                        }
                    } else {
                        if(pixel_o.a !== 0) {
                            numOfBlockingPixelsOnRightHandSide_i++;
                        }
                    }
                }
                if(numOfBlockingPixelsOnLeftHandSide_i || numOfBlockingPixelsOnRightHandSide_i) {
                    if(numOfBlockingPixelsOnLeftHandSide_i + numOfBlockingPixelsOnRightHandSide_i < 12) {
                        if(numOfBlockingPixelsOnLeftHandSide_i < numOfBlockingPixelsOnRightHandSide_i) {
                            pixel_o = getPixel(imageData, pacMan_o.x - 1, pacMan_o.y + 5);
                            if(pixel_o.a === 0) {
                                pacMan_o.x--;
                            }
                        } else {
                            pixel_o = getPixel(imageData, pacMan_o.x + 12, pacMan_o.y + 5);
                            if(pixel_o.a === 0) {
                                pacMan_o.x++;
                            }
                        }
                    }
                } else {
                    pacMan_o.y++;
                }
                break;
            case 'left':
                if(pacMan_o.x < 5) {
                    pacMan_o.x = 150;
                } else {
                    for(y = 0; y < 12; y++) {
                        pixel_o = getPixel(imageData, pacMan_o.x, pacMan_o.y + y);
                        if(y < 6) {
                            if(pixel_o.a !== 0) {
                                numOfBlockingPixelsOnUpHandSide_i++;
                            }
                        } else {
                            if(pixel_o.a !== 0) {
                                numOfBlockingPixelsOnDownHandSide_i++;
                            }
                        }
                    }
                    if(numOfBlockingPixelsOnUpHandSide_i || numOfBlockingPixelsOnDownHandSide_i) {
                        if(numOfBlockingPixelsOnUpHandSide_i + numOfBlockingPixelsOnDownHandSide_i < 12) {
                            if(numOfBlockingPixelsOnUpHandSide_i < numOfBlockingPixelsOnDownHandSide_i) {
                                pixel_o = getPixel(imageData, pacMan_o.x + 5, pacMan_o.y - 1);
                                if(pixel_o.a === 0) {
                                    pacMan_o.y--;
                                }
                            } else {
                                pixel_o = getPixel(imageData, pacMan_o.x + 5, pacMan_o.y + 12);
                                if(pixel_o.a === 0) {
                                    pacMan_o.y++;
                                }
                            }
                        }
                    } else {
                        pacMan_o.x--;
                    }
                }
                break;
            case 'right':
                if(pacMan_o.x > 152) {
                    pacMan_o.x = 0;
                } else {
                    for(y = 0; y < 12; y++) {
                        pixel_o = getPixel(imageData, pacMan_o.x + 12, pacMan_o.y + y);
                        if(y < 6) {
                            if(pixel_o.a !== 0) {
                                numOfBlockingPixelsOnUpHandSide_i++;
                            }
                        } else {
                            if(pixel_o.a !== 0) {
                                numOfBlockingPixelsOnDownHandSide_i++;
                            }
                        }
                    }
                    if(numOfBlockingPixelsOnUpHandSide_i || numOfBlockingPixelsOnDownHandSide_i) {
                        if(numOfBlockingPixelsOnUpHandSide_i + numOfBlockingPixelsOnDownHandSide_i < 12) {
                            if(numOfBlockingPixelsOnUpHandSide_i < numOfBlockingPixelsOnDownHandSide_i) {
                                pixel_o = getPixel(imageData, pacMan_o.x + 5, pacMan_o.y - 1);
                                if(pixel_o.a === 0) {
                                    pacMan_o.y--;
                                }
                            } else {
                                pixel_o = getPixel(imageData, pacMan_o.x + 5, pacMan_o.y + 12);
                                if(pixel_o.a === 0) {
                                    pacMan_o.y++;
                                }
                            }
                        }
                    } else {
                        pacMan_o.x++;
                    }
                }
                
                break;
        }
        
        if(false/*movePacMan_b/*pixel_o && pixel_o.a === 0*/) {
            pacMan_o.x = nextX_i;
            pacMan_o.y = nextY_i;
        }
        //document.getElementById('pac-man-y').innerHTML = Math.round(pacMan_o.y);
        //document.getElementById('pac-man-x').innerHTML = Math.round(pacMan_o.x);
        //document.getElementById('pixel').innerHTML = JSON.stringify(getPixel(imageData, pacMan_o.x, pacMan_o.y - 1));
        //renderer_o.render(backgroundContainer_o);
        // rectangle.beginFill(0xFFFFFF);
        // rectangle.drawRect(pacMan_o.x, pacMan_o.y, 2, 2);
        // rectangle.endFill();
        
        if(direction_s !== 'none' && changeFrame_i > 5) {
            if(currentFrame_s.indexOf('1') !== -1) {
                currentFrame_s = 'pac-man-' + direction_s + '-2.png';
            } else if(currentFrame_s.indexOf('2') !== -1) {
                currentFrame_s = 'pac-man-full.png';
            } else {
                currentFrame_s = 'pac-man-' + direction_s + '-1.png';
            }
            //pacMan_o.setTexture(id[currentFrame_s]);
            pacMan_o.texture = id[currentFrame_s];
            changeFrame_i = 0;
        }
        changeFrame_i++;
        


        renderer_o.render(stage_o);
    }
    var keyIsDown = false;
    
    document.addEventListener('keydown', function(e) {
        
        if(keyIsDown) {
            return;
        }
        console.log(e.keyCode);
        keyIsDown = true;
        //document.getElementById('pac-man-y').innerHTML = Math.round(pacMan_o.y);
        //document.getElementById('pac-man-x').innerHTML = Math.round(pacMan_o.x);
        
        
        switch(e.keyCode) {
            case 38: // Up
                direction_s = 'up';
                speedY_i = -20;
                break;
            case 40: // Down
                direction_s = 'down';
                speedY_i = 20;
                break;
            case 39: // Right
                direction_s = 'right';
                speedX_i = 20;
                break;
            case 37: // Left
                direction_s = 'left';
                speedX_i = -20;
                break;
        }
        currentFrame_s = 'pac-man-' + direction_s + '-1.png';
        //pacMan_o.setTexture(id[currentFrame_s]);
        pacMan_o.texture = id[currentFrame_s];
        
        //document.getElementById('pixel').innerHTML = JSON.stringify(pixel_o);
        //document.getElementById('background-y').innerHTML = Math.round(pacMan_o.y);
        //document.getElementById('background-x').innerHTML = Math.round(pacMan_o.x);
    });

    document.addEventListener('keyup', function(e) {
        keyIsDown = speedX_i = speedY_i = 0;
        direction_s = 'none';
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