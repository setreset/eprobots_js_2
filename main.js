var simulation = null;

function toggleRun() {
    if (simulation.getRunning()){
        $("#btn_reset").removeAttr("disabled");
        $("#btn_start").text("Start");
        simulation.stop_simulation();
    }else{
        $("#btn_reset").attr("disabled", "disabled");
        $("#btn_start").text("Stop");
        simulation.start_simulation();
    }
}

$(document).ready(function() {
    console.log("ready");

    if (typeof Math.seedrandom === "function") {
        console.log("Math.seedrandom vorhanden");
        //var seed = makeid(8);
        var seed="abc";
        console.log("seedRandom: "+ seed);
        Math.seedrandom(seed);
    }else{
        console.log("Math.seedrandom nicht vorhanden");
    }

    var simulation_canvas = document.getElementById('canvas');
    var simulation_canvas2 = document.getElementById('canvas2');
    simulation = new Simulation(simulation_canvas, simulation_canvas2);
    simulation.init();
    simulation.init_eprobots();
    simulation.drawer.paint_fast();

    function toggleFullscreen() {
        var elem = simulation_canvas;
        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    document.addEventListener('fullscreenchange', on_fullscreen_change);
    document.addEventListener('mozfullscreenchange', on_fullscreen_change);
    document.addEventListener('webkitfullscreenchange', on_fullscreen_change);

    function on_fullscreen_change() {
        console.log("fullscreen change");
        simulation.drawer.init_canvas();
        simulation.drawer.paint_full();
    }

    function getMousePos(canvas_rect, evt) {
        return {
            x: parseInt(evt.clientX - canvas_rect.left),
            y: parseInt(evt.clientY - canvas_rect.top)
        };
    }

    function clickcanvas(e){
        //console.log(e);
        let canvas_rect = simulation_canvas.getBoundingClientRect();
        var mousePos = getMousePos(canvas_rect, e);
        //console.log("x:" + mousePos.x + " y:" + mousePos.y);

        // hot corner
        if (mousePos.x>=canvas_rect.width-30 && mousePos.y>=canvas_rect.height-30){
            toggleFullscreen();
        }else{
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, simulation.settings.world_width));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, simulation.settings.world_height));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            let t = simulation.world.get_terrain(world_x, world_y);
            if (simulation.draw_mode == OBJECTTYPES.PLANT){
                if (t.energy_object == null){
                    let p = new Plant(simulation);
                    simulation.world.world_set_energy(p, world_x, world_y);
                    //simulation.active_objects.push(p);
                    simulation.drawer.paint_fast();
                }else{
                    console.log("besetzt");
                }
            }else if (simulation.draw_mode == OBJECTTYPES.BARRIER){
                if (t.slot_object == null){
                    let b = new Barrier(simulation);
                    simulation.world.world_set(b, world_x, world_y);
                    //simulation.active_objects.push(p);
                    simulation.drawer.paint_fast();
                }else{
                    console.log("besetzt");
                }
            }
        }

    }

    simulation_canvas.addEventListener("click", clickcanvas);
    //simulation_canvas.addEventListener("dblclick", toggleFullscreen);

    document.getElementById('colorpicker-plant').addEventListener("click", function(e){
        console.log("plant selektiert");
        simulation.set_draw_mode(OBJECTTYPES.PLANT);
    });

    document.getElementById('colorpicker-barrier').addEventListener("click", function(e){
        console.log("barrier selektiert");
        simulation.set_draw_mode(OBJECTTYPES.BARRIER);
    });

    $("#btn_start").on("click", toggleRun);

    $("#btn_reset").on("click", function(e){
        simulation = new Simulation(simulation_canvas, simulation_canvas2);
        simulation.init();
        simulation.init_eprobots();
        simulation.drawer.paint_fast();
    });

    $("#btn_init_eprobots").on("click", function(e){
        simulation.init_eprobots();
        simulation.drawer.paint_fast();
    });

    $("#btn_load").on("click", function(e){
        var simsavestate = $("#simsavestate").val();
        var simsavestateobj = JSON.parse(simsavestate);

        // neue simulation initialisieren
        simulation = new Simulation(simulation_canvas, simulation_canvas2);
        simulation.loadState(simsavestateobj);

        simulation.drawer.paint_fast();
        //simulation.drawer.paint_full();
    });

    $("#btn_save").on("click", function(e){
        var simsavestate = JSON.stringify(simulation);
        //var simsavestate = JSON.stringify(simulation, null, '  ');
        $("#simsavestate").val(simsavestate);
    });

    $("#btn_load_from_localstorage").on("click", function(e){
        var simsavestate = localStorage.getItem('simsavestate');
        var simsavestateobj = JSON.parse(simsavestate);

        // neue simulation initialisieren
        simulation = new Simulation(simulation_canvas, simulation_canvas2);
        simulation.loadState(simsavestateobj);

        simulation.drawer.paint_fast();
    });

    $("#btn_save_to_localstorage").on("click", function(e){
        var simsavestate = JSON.stringify(simulation);
        localStorage.setItem("simsavestate", simsavestate);
    });

    $("#btn_fullscreen").on("click", toggleFullscreen);
});