class Controller {
    constructor() {
        this.running = false;
        this.draw_mode = 0;
        this.init_simulation();
    }

    toggle_run(){
        if (this.running){
            controls["btn_reset"].removeAttr("disabled");
            controls["btn_start"].text("Start");
            this.stop_simulation();
        }else{
            controls["btn_reset"].attr("disabled", "disabled");
            controls["btn_start"].text("Stop");
            this.start_simulation();
        }
    }

    start_simulation(){
        this.time_start = new Date();

        this.running = true;

        this.simulation_loop();
    }

    simulation_loop(){
        let steptime_start = new Date().getTime();

        if (this.simulation.world.counter_eprobot == 0){
            //this.simulation.init_eprobots();

            //console.log("died");
            //var duration = (new Date()-this.time_start)/1000;
            //console.log("duration seconds: "+duration);
            //console.log("steps: "+this.simulation.steps);
            //this.stop_simulation();
            //return;
        }

        this.simulation.simulation_step();

        let steptime_end = new Date().getTime();
        let frame_time = steptime_end - steptime_start;

        this.simulation.drawer.paint_fast();

        if (this.running) {
            let st = this.simulation.settings.sleeptime - frame_time;
            setTimeout(()=>{this.simulation_loop()}, st);
        }
    }

    stop_simulation(){
        this.running = false;
    }

    init_simulation(){
        this.simulation = new Simulation(controls["simulation_canvas"][0], controls["simulation_canvas2"][0]);
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
        var elem = controls["simulation_canvas"][0];
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

        let canvas_rect = controls["simulation_canvas"][0].getBoundingClientRect();
        var mousePos = this._get_mouse_pos(canvas_rect, e);

        // hot corner
        if (mousePos.x>=canvas_rect.width-30 && mousePos.y>=canvas_rect.height-30){
            this.toggle_fullscreen();
        }else{
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, this.simulation.settings.world_width));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, this.simulation.settings.world_height));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            let t = this.simulation.world.get_terrain(world_x, world_y);
            if (this.draw_mode == OBJECTTYPES.PLANT.id){
                if (t.energy_object == null){
                    let p = new Plant(this.simulation);
                    this.simulation.world.world_set_energy(p, world_x, world_y);
                    //simulation.active_objects.push(p);
                    this.simulation.drawer.paint_fast();
                }else{
                    console.log("besetzt");
                }
            }else if (this.draw_mode == OBJECTTYPES.BARRIER.id){
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

    click_simitem_selector(id){
        console.log(id + " selektiert");
        this._set_draw_mode(id);
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
        this.simulation = new Simulation(controls["simulation_canvas"][0], controls["simulation_canvas2"][0]);
        this.simulation.loadState(simsavestateobj);

        this.simulation.drawer.paint_fast();
        //simulation.drawer.paint_full();
    }

    click_save(){
        var simsavestate = JSON.stringify(this.simulation);
        //var simsavestate = JSON.stringify(simulation, null, '  ');
        controls["textbox_simsavestate"].val(simsavestate);
    }

    click_load_from_ls(){
        var simsavestate_compressed = localStorage.getItem('simsavestate_compressed');
        var simsavestate = LZString.decompress(simsavestate_compressed);

        var simsavestateobj = JSON.parse(simsavestate);

        // neue simulation initialisieren
        this.simulation = new Simulation(controls["simulation_canvas"][0], controls["simulation_canvas2"][0]);
        this.simulation.loadState(simsavestateobj);

        this.simulation.drawer.paint_fast();
    }

    click_save_to_ls(){
        var simsavestate = JSON.stringify(this.simulation);
        console.log(simsavestate.length);
        var simsavestate_compressed = LZString.compress(simsavestate);
        console.log(simsavestate_compressed.length);
        try{
            localStorage.setItem("simsavestate_compressed", simsavestate_compressed);
        }catch(err){
            alert("Error: "+err);
        }

    }

    get_object_types(){
        return this.simulation.get_object_types();
    }
}