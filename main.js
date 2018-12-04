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
    controls["btn_seed_eprobots"] = $("#btn_seed_eprobots");
    controls["btn_seed_eproboteaters"] = $("#btn_seed_eproboteaters");
    controls["btn_seed_energy"] = $("#btn_seed_energy");
    controls["simitem-selector"] = $("#simitem-selector");
    controls["btn_load"] = $("#btn_load");
    controls["btn_save"]= $("#btn_save");
    controls["textbox_simsavestate"] = $("#simsavestate");
    controls["btn_load_from_localstorage"] = $("#btn_load_from_localstorage");
    controls["btn_save_to_localstorage"] = $("#btn_save_to_localstorage");

    var controller = new Controller();

    document.addEventListener('fullscreenchange', function(ev){controller.on_fullscreen_change();});
    document.addEventListener('mozfullscreenchange', function(ev){controller.on_fullscreen_change();});
    document.addEventListener('webkitfullscreenchange', function(ev){controller.on_fullscreen_change();});

    //controls["simulation_canvas"].on("click", function(ev){controller.click_canvas(ev)});
    controls["simulation_canvas"].on("mousemove", function(ev){controller.mousemove_canvas(ev)});
    controls["simulation_canvas"].on("mouseup", function(ev){controller.mouseup_canvas(ev)});
    controls["simulation_canvas"].on("mousedown", function(ev){controller.mousedown_canvas(ev)});

    controls["simitem-selector"].on("click", "span", function(e){
        console.log("simitem-selector span");
        console.log($(this).attr("id"));

        let elem_id = $(this).attr("id");
        let object_id = elem_id.split("-")[1];
        controller.click_simitem_selector(object_id);
    });

    controls["btn_start"].on("click", function(ev){controller.toggle_run()});

    controls["btn_reset"].on("click", function(e){controller.reset_simulation()});

    controls["btn_seed_eprobots"].on("click", function(e){controller.seed_eprobots()});

    controls["btn_seed_eproboteaters"].on("click", function(e){controller.seed_eproboteaters()});

    controls["btn_seed_energy"].on("click", function(e){controller.seed_energy()});

    controls["btn_fullscreen"].on("click", function(ev){controller.toggle_fullscreen()});

    controls["btn_load"].on("click", function(e){controller.click_load()});

    controls["btn_save"].on("click", function(e){controller.click_save()});

    controls["btn_load_from_localstorage"].on("click", function(e){controller.click_load_from_ls()});

    controls["btn_save_to_localstorage"].on("click", function(e){controller.click_save_to_ls()});

    // setup simitem-selector
    Object.entries(controller.get_object_types()).forEach(function(o) {
        //console.log(o[0]+" "+o[1]);

        let object_value = o[1];
        if (object_value['drawable']){
            let span = '<span id="colorpicker-'+object_value['id']+'" style="width:20px; height:15px; background-color: '+object_value['color']+'; display: inline-block; margin-right: 4px"></span>';
            controls["simitem-selector"].append(span);
        }
    }, this);
});