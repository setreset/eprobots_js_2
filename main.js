$(document).ready(function() {
    console.log("ready");

    function toggleFullscreen() {
        var elem = document.getElementById('canvas');
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

    function toggleRun() {
        if (simulation.getRunning()){
            simulation.stopSimulation();
            $("#btn_reset").removeAttr("disabled");
            $("#btn_start").text("Start");
        }else{
            simulation.startSimulation();
            $("#btn_reset").attr("disabled", "disabled");
            $("#btn_start").text("Stop");
        }
    }

    document.addEventListener('fullscreenchange', on_fullscreen_change);
    document.addEventListener('mozfullscreenchange', on_fullscreen_change);
    document.addEventListener('webkitfullscreenchange', on_fullscreen_change);

    function on_fullscreen_change() {
        console.log("fullscreen change");
        simulation.drawer.init_canvas();
        simulation.drawer.paint_fast();
    }

    var simulation_canvas = document.getElementById('canvas');
    var simulation_canvas2 = document.getElementById('canvas2');
    var simulation = new Simulation(simulation_canvas, simulation_canvas2);
    simulation.drawer.paint_fast();

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

        let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, simulation.settings.world_width));
        let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, simulation.settings.world_height));
        //console.log("x_world:" + world_x + " y_world:" + world_y);
        let t = simulation.world.get_terrain(world_x, world_y);
        if (t.slot_object == null){
            let p = new Plant(simulation, world_x, world_y);
            simulation.active_objects.push(p);
            simulation.drawer.paint_fast();
        }else{
            console.log("besetzt");
        }
    }

    simulation_canvas.addEventListener("click", clickcanvas);

    $("#btn_start").on("click", toggleRun);

    $("#btn_reset").on("click", function(e){

    });

    $("#btn_fullscreen").on("click", toggleFullscreen);
});