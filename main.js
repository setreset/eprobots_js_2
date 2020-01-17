var controls = {};
var con;

$(document).ready(function() {
    log("ready");

    if (typeof Math.seedrandom === "function") {
        log("Math.seedrandom vorhanden");
        //var seed = makeid(8);
        var seed="abc";
        log("seedRandom: "+ seed);
        Math.seedrandom(seed);
    }else{
        log("Math.seedrandom nicht vorhanden");
    }

    controls["simulation_canvas"] = $("#canvas");
    controls["btn_reset"] = $("#btn_reset");
    controls["btn_start"] = $("#btn_start");
    controls["btn_fullscreen"] = $("#btn_fullscreen");
    controls["btn_seed_energy"] = $("#btn_seed_energy");
    controls["simitem-selector"] = $("#simitem-selector");
    controls["btn_load"] = $("#btn_load");
    controls["btn_save"]= $("#btn_save");
    controls["textbox_simsavestate"] = $("#simsavestate");
    controls["btn_load_from_localstorage"] = $("#btn_load_from_localstorage");
    controls["btn_save_to_localstorage"] = $("#btn_save_to_localstorage");
    controls["textbox_settings"] = $("#textbox_settings");
    controls["btn_set_settings"] = $("#btn_set_settings");

    var controller = new Controller();
    con = controller;

    document.addEventListener('fullscreenchange', function(ev){controller.on_fullscreen_change();});
    document.addEventListener('mozfullscreenchange', function(ev){controller.on_fullscreen_change();});
    document.addEventListener('webkitfullscreenchange', function(ev){controller.on_fullscreen_change();});

    controls["simulation_canvas"].on("click", function(ev){controller.click_canvas(ev)});
    //controls["simulation_canvas"].on("mousemove", function(ev){controller.mousemove_canvas(ev)});
    //controls["simulation_canvas"].on("mouseup", function(ev){controller.mouseup_canvas(ev)});
    //controls["simulation_canvas"].on("mousedown", function(ev){controller.mousedown_canvas(ev)});

    controls["simitem-selector"].on("click", "span", function(e){
        log("simitem-selector span");
        log($(this).attr("id"));

        let elem_id = $(this).attr("id");
        let objects_id_string = elem_id.split("-")[1];
        let object_id = null;
        if (objects_id_string!="none"){
            object_id = parseInt(objects_id_string);
        }

        controller.click_simitem_selector(object_id);
    });

    controls["btn_start"].on("click", function(ev){controller.toggle_run()});

    controls["btn_reset"].on("click", function(e){controller.reset_simulation()});

    //controls["btn_seed_energy"].on("click", function(e){controller.seed_energy()});

    controls["btn_fullscreen"].on("click", function(ev){controller.toggle_fullscreen()});

    controls["btn_load"].on("click", function(e){controller.click_load()});

    controls["btn_save"].on("click", function(e){controller.click_save()});

    controls["btn_load_from_localstorage"].on("click", function(e){controller.click_load_from_ls()});

    controls["btn_save_to_localstorage"].on("click", function(e){controller.click_save_to_ls()});

    controls["btn_set_settings"].on("click", function(e){controller.click_set_settings()});

    // setup simitem-selector

    // null value
    let colortheme = controller.get_colortheme();
    let span = '<span id="colorpicker-none" style="width:20px; height:15px; background-color: #000000; display: inline-block; margin-right: 4px"></span>';
    if(colortheme=="bright"){
        span = '<span id="colorpicker-none" style="width:20px; height:15px; background-color: #ffffff; display: inline-block; margin-right: 4px"></span>';
    }

    controls["simitem-selector"].append(span);

    let o_types = controller.get_object_types();
    for (let key in o_types){
        let object_value = o_types[key];
        if (object_value['drawable']){
            let span = '<span id="colorpicker-'+object_value['id']+'" style="width:20px; height:15px; background-color: '+object_value['color'][colortheme]+'; display: inline-block; margin-right: 4px"></span>';
            controls["simitem-selector"].append(span);
        }
    }
});