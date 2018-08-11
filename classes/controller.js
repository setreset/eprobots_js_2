class Controller {
    constructor() {
        this.draw_mode = 0;
        this.init_simulation();
    }

    toggle_run(){
        if (this.simulation.getRunning()){
            controls["btn_reset"].removeAttr("disabled");
            controls["btn_start"].text("Start");
            this.simulation.stop_simulation();
        }else{
            controls["btn_reset"].attr("disabled", "disabled");
            controls["btn_start"].text("Stop");
            this.simulation.start_simulation();
        }
    }

    init_simulation(){
        this.simulation = new Simulation(controls["simulation_canvas"], controls["simulation_canvas2"]);
        this.simulation.init();
        this.simulation.init_eprobots();
        this.simulation.drawer.paint_fast();
    }

    init_eprobots(){
        this.simulation.init_eprobots();
        this.simulation.drawer.paint_fast();
    }

    reset_simulation(){
        this.init_simulation();
    }

    toggle_fullscreen() {
        var elem = controls["simulation_canvas"];
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

    _get_mouse_pos(canvas_rect, evt) {
        return {
            x: parseInt(evt.clientX - canvas_rect.left),
            y: parseInt(evt.clientY - canvas_rect.top)
        };
    }

    click_canvas(e){

        let canvas_rect = controls["simulation_canvas"].getBoundingClientRect();
        var mousePos = this._get_mouse_pos(canvas_rect, e);

        // hot corner
        if (mousePos.x>=canvas_rect.width-30 && mousePos.y>=canvas_rect.height-30){
            this.toggle_fullscreen();
        }else{
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, this.simulation.settings.world_width));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, this.simulation.settings.world_height));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            let t = this.simulation.world.get_terrain(world_x, world_y);
            if (this.draw_mode == OBJECTTYPES.PLANT){
                if (t.energy_object == null){
                    let p = new Plant(this.simulation);
                    this.simulation.world.world_set_energy(p, world_x, world_y);
                    //simulation.active_objects.push(p);
                    this.simulation.drawer.paint_fast();
                }else{
                    console.log("besetzt");
                }
            }else if (this.draw_mode == OBJECTTYPES.BARRIER){
                if (t.slot_object == null){
                    let b = new Barrier(this.simulation);
                    this.simulation.world.world_set(b, world_x, world_y);
                    //simulation.active_objects.push(p);
                    this.simulation.drawer.paint_fast();
                }else{
                    console.log("besetzt");
                }
            }
        }

    }

    click_colorpicker_plant(){
        console.log("plant selektiert");
        this._set_draw_mode(OBJECTTYPES.PLANT);
    }

    click_colorpicker_barrier(){
        console.log("barrier selektiert");
        this._set_draw_mode(OBJECTTYPES.BARRIER);
    }

    on_fullscreen_change() {
        console.log("fullscreen change");
        this.simulation.drawer.init_canvas();
        this.simulation.drawer.paint_full();
    }

    _set_draw_mode(dm){
        this.draw_mode = dm;
    }

    click_load(){
        var simsavestate = controls["textbox_simsavestate"].val();
        var simsavestateobj = JSON.parse(simsavestate);

        // neue simulation initialisieren
        this.simulation = new Simulation(controls["simulation_canvas"], controls["simulation_canvas2"]);
        this.simulation.loadState(simsavestateobj);

        this.simulation.drawer.paint_fast();
        //simulation.drawer.paint_full();
    }

    click_load_from_ls(){
        var simsavestate = localStorage.getItem('simsavestate');
        var simsavestateobj = JSON.parse(simsavestate);

        // neue simulation initialisieren
        this.simulation = new Simulation(controls["simulation_canvas"], controls["simulation_canvas2"]);
        this.simulation.loadState(simsavestateobj);

        this.simulation.drawer.paint_fast();
    }

    click_save(){
        var simsavestate = JSON.stringify(this.simulation);
        //var simsavestate = JSON.stringify(simulation, null, '  ');
        controls["textbox_simsavestate"].val(simsavestate);
    }

    click_save_to_ls(){
        var simsavestate = JSON.stringify(this.simulation);
        localStorage.setItem("simsavestate", simsavestate);
    }
}