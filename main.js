var controls = {};

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

    controls["simulation_canvas"] = $("#canvas");
    controls["simulation_canvas2"] = $("#canvas2");
    controls["btn_reset"] = $("#btn_reset");
    controls["btn_start"] = $("#btn_start");
    controls["btn_fullscreen"] = $("#btn_fullscreen");
    controls["btn_init_eprobots"] = $("#btn_init_eprobots");
    controls["colorpicker-plant"] = document.getElementById('colorpicker-plant');
    controls["colorpicker-barrier"] = document.getElementById('colorpicker-barrier');
    controls["btn_load"] = $("#btn_load");
    controls["btn_save"]= $("#btn_save");
    controls["textbox_simsavestate"] = $("#simsavestate");
    controls["btn_load_from_localstorage"] = $("#btn_load_from_localstorage");
    controls["btn_save_to_localstorage"] = $("#btn_save_to_localstorage");

    var controller = new Controller();

    document.addEventListener('fullscreenchange', function(ev){controller.on_fullscreen_change();});
    document.addEventListener('mozfullscreenchange', function(ev){controller.on_fullscreen_change();});
    document.addEventListener('webkitfullscreenchange', function(ev){controller.on_fullscreen_change();});

    controls["simulation_canvas"].on("click", function(ev){controller.click_canvas(ev)});
    //simulation_canvas.addEventListener("dblclick", toggleFullscreen);

    controls["colorpicker-plant"].addEventListener("click", function(e){controller.click_colorpicker_plant()});
    controls["colorpicker-barrier"].addEventListener("click", function(e){controller.click_colorpicker_barrier()});

    controls["btn_start"].on("click", function(ev){controller.toggle_run()});

    controls["btn_reset"].on("click", function(e){controller.reset_simulation()});

    controls["btn_init_eprobots"].on("click", function(e){controller.init_eprobots()});

    controls["btn_fullscreen"].on("click", function(ev){controller.toggle_fullscreen()});

    controls["btn_load"].on("click", function(e){controller.click_load()});

    controls["btn_save"].on("click", function(e){controller.click_save()});

    controls["btn_load_from_localstorage"].on("click", function(e){controller.click_load_from_ls()});

    controls["btn_save_to_localstorage"].on("click", function(e){controller.click_save_to_ls()});
});