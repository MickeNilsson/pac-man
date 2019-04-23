(function(){

    var renderer_o = PIXI.autoDetectRenderer({
        transparent: false,
        antialias: true,
        backgroundColor: 0x0000aa,
        clearBeforeRender: true
    });

    renderer_o.view.style.position = 'absolute';
    renderer_o.view.style.display = 'block';
    renderer_o.autoResize = true;
    renderer_o.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer_o.view);
    var container_o = new PIXI.particles.ParticleContainer(
        100, // Max antal sprites (högst 1500).
    {	
    position: true,
        rotation: true,
        uvs: true, // Måste vara true om en sprite kommer att ändra textur.
        tint: true // Alpha
    });

    PIXI.loader.add(['./img/pac-man.json']).load(spriteSetUp);

    var pacMan_o;

    function spriteSetUp() {

        var id = PIXI.loader.resources['./img/pac-man.json'].textures;
        pacMan_o = new PIXI.Sprite(id['pac-man-full.png']);
        pacMan_o.x = 100;
        pacMan_o.y = 100;
        container_o.addChild(pacMan_o);
        renderer_o.render(container_o);
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
   
    var speed_x = 40;

    function update( elapsed ) {
        var delta = elapsed / 1000;
        pacMan_o.x = pacMan_o.x + speed_x * delta;
        renderer_o.render(container_o);
    }
    

}());