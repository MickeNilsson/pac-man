(function(){

    // Sound effect from https://freesound.org/people/InspectorJ/sounds/411642/
    var image = new Image();
    var imageData;
    var speedX_i = 0;
    var speedY_i = 0;
    var pixel_o;
    var direction_s = 'none';
    var pacManAnimationFrame_s = 'full';
    var pacMan_o;
    var ghost_o;
    var ghosts_ao = [];
    ghosts_ao.colors = ['red', 'purple', 'blue', 'orange'];
    var coins_ao = [];
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
        
        placeCoins();

        for(var i = 0; i < 4; i++) {
            var color = ghosts_ao.colors[i];
            ghosts_ao.push(createGhost(color));
        }
        function createGhost(color) {
            var ghost_o = new PIXI.Sprite(id[color + '-ghost-up-1.png']);
            ghost_o.isBlocked_b = false;
            ghost_o.direction_s = 'up';
            ghost_o.currentFrame_s = color + '-ghost-up-1.png';
            ghost_o.changeFrame_i = 0;
            ghost_o.x = 100;
            ghost_o.y = 100;
            ghost_o.color_s = color;
            container_o.addChild(ghost_o);
            return ghost_o;
        }
        pacMan_o = new PIXI.Sprite(id['pac-man-full.png']);
        pacMan_o.x = 10;
        pacMan_o.y = 100;
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
   
    function placeCoins() {
        var dist = 8;
        var numOfCoins_i = 0;
        var x, y, pixel_o;
        var startY_i = 9;
        var startX_i = 9;
        var numOfCoinsY_i = 25;
        var numOfCoins_X_i = 19;
        for(y = startY_i; y < 205; y += dist) {
            for(x = startX_i; x < 160; x += dist) {
                pixel_o = getPixel(imageData, x, y);
                if(pixel_o.a === 0) {
                    numOfCoins_i++;
                    placeCoinAt(x, y);
                }
            }
        }
       ;
        function placeCoinAt(x, y) {
            var coin_o = new PIXI.Sprite(id['coin.png']);
            coin_o.x = x;
            coin_o.y = y;
            coins_ao.push(coin_o);
            stage_o.addChild(coin_o);
        }
    }

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
                if(pacMan_o.x < 2) {
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
        
        for(var i = 0; i < 4; i++) {
            var ghost_o = ghosts_ao[i];
            move(ghost_o);
            if(ghost_o.isBlocked_b) {
                var directions_a = ['up', 'down', 'left', 'right'];
                ghost_o.direction_s = directions_a[Math.floor(Math.random() * 10 % 4)];
                ghost_o.isBlocked_b = false;
            }
            if(ghost_o.changeFrame_i++ > 5) {
                if(ghost_o.currentFrame_s.indexOf('1') !== -1) {
                    ghost_o.currentFrame_s = ghost_o.color_s + '-ghost-' + ghost_o.direction_s + '-2.png';
                } else {
                    ghost_o.currentFrame_s = ghost_o.color_s + '-ghost-' + ghost_o.direction_s + '-1.png';
                }
                ghost_o.texture = id[ghost_o.currentFrame_s];
                ghost_o.changeFrame_i = 0;
            }
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
        
        for(var i = 0; i < coins_ao.length; i++) {
            var distance_f = Math.sqrt(Math.pow((pacMan_o.x + 6 - coins_ao[i].x), 2)
                           + Math.pow((pacMan_o.y + 6 - coins_ao[i].y), 2));
            if(distance_f < 6) {
                document.getElementById('sound').pause();
                document.getElementById('sound').currentTime = 0;
                document.getElementById('sound').play();
                coins_ao[i].texture = null;
                coins_ao.splice(i, 1);
            }
        }

        // Check collision with ghosts.
        for(i = 0; i < ghosts_ao.length; i++) {
            var distance_f = Math.sqrt(Math.pow((pacMan_o.x + 6 - (ghosts_ao[i].x + 6)), 2)
                           + Math.pow((pacMan_o.y + 6 - (ghosts_ao[i].y + 6)), 2));
            if(distance_f < 12) {
                pacMan_o.x = 10;
                pacMan_o.y = 100;
            }
        }

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



function move(sprite_o) {
    var pixel_o,
        numOfBlockingPixelsOnLeftHandSide_i = 0,
        numOfBlockingPixelsOnRightHandSide_i = 0,
        numOfBlockingPixelsOnUpHandSide_i = 0,
        numOfBlockingPixelsOnDownHandSide_i = 0;
    switch(sprite_o.direction_s) {
        case 'up':
            for(x = 0; x < 12; x++) {
                pixel_o = getPixel(imageData, sprite_o.x + x, sprite_o.y);
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
                        pixel_o = getPixel(imageData, sprite_o.x - 1, sprite_o.y + 5);
                        if(pixel_o.a === 0) {
                            sprite_o.x--;
                        }
                    } else {
                        pixel_o = getPixel(imageData, sprite_o.x + 12, sprite_o.y + 5);
                        if(pixel_o.a === 0) {
                            sprite_o.x++;
                        }
                    }
                } else {
                    // The sprite is blocked.
                    sprite_o.isBlocked_b = true;
                }
            } else {
                sprite_o.y--;
            }
            break;
        case 'down':
            for(var x = 0; x < 12; x++) {
                pixel_o = getPixel(imageData, sprite_o.x + x, sprite_o.y + 12);
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
                        pixel_o = getPixel(imageData, sprite_o.x - 1, sprite_o.y + 5);
                        if(pixel_o.a === 0) {
                            sprite_o.x--;
                        }
                    } else {
                        pixel_o = getPixel(imageData, sprite_o.x + 12, sprite_o.y + 5);
                        if(pixel_o.a === 0) {
                            sprite_o.x++;
                        }
                    }
                } else {
                    sprite_o.isBlocked_b = true;
                }
            } else {
                sprite_o.y++;
            }
            break;
        case 'left':
            if(sprite_o.x < 2) {
                sprite_o.x = 150;
            } else {
                for(y = 0; y < 12; y++) {
                    pixel_o = getPixel(imageData, sprite_o.x, sprite_o.y + y);
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
                            pixel_o = getPixel(imageData, sprite_o.x + 5, sprite_o.y - 1);
                            if(pixel_o.a === 0) {
                                sprite_o.y--;
                            }
                        } else {
                            pixel_o = getPixel(imageData, sprite_o.x + 5, sprite_o.y + 12);
                            if(pixel_o.a === 0) {
                                sprite_o.y++;
                            }
                        }
                    } else {
                        sprite_o.isBlocked_b = true;
                    }
                } else {
                    sprite_o.x--;
                }
            }
            break;
        case 'right':
            if(sprite_o.x > 152) {
                sprite_o.x = 0;
            } else {
                for(y = 0; y < 12; y++) {
                    pixel_o = getPixel(imageData, sprite_o.x + 12, sprite_o.y + y);
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
                            pixel_o = getPixel(imageData, sprite_o.x + 5, sprite_o.y - 1);
                            if(pixel_o.a === 0) {
                                sprite_o.y--;
                            }
                        } else {
                            pixel_o = getPixel(imageData, sprite_o.x + 5, sprite_o.y + 12);
                            if(pixel_o.a === 0) {
                                sprite_o.y++;
                            }
                        }
                    } else {
                        sprite_o.isBlocked_b = true;
                    }
                } else {
                    sprite_o.x++;
                }
            }
            break;
    }   
}

}());