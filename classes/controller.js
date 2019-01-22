var sim;

class Controller {
    constructor() {
        this.running = false;
        this.draw_mode = 0;
        this.mouse_down = false;
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

        this.simulation.simulation_prestep();
        this.simulation.simulation_step();

        let steptime_end = new Date().getTime();
        let current_frame_time = steptime_end - steptime_start;

        this.simulation.drawer.paint_fast();

        if (this.running) {
            let st = this.frame_time - current_frame_time;
            if (this.simulation.steps % 100 == 0){
                console.log("st: "+st);
                if (st > 2){
                    this.simulation.settings.eprobots_max += 5;
                    console.log("increase eprobots_max: "+this.simulation.settings.eprobots_max);
                }else if(st < 1 && this.simulation.settings.eprobots_max > 0){
                    this.simulation.settings.eprobots_max -= 5;
                    if (this.simulation.settings.eprobots_max < 0){
                        this.simulation.settings.eprobots_max = 0;
                    }
                    console.log("reduce eprobots_max: "+this.simulation.settings.eprobots_max);
                }
            }

            setTimeout(()=>{this.simulation_loop()}, st);
        }
    }

    stop_simulation(){
        this.running = false;
    }

    init_simulation(){
        this.simulation = new Simulation(controls["simulation_canvas"][0], controls["simulation_canvas2"][0]);
        this.simulation.init();
        //this.simulation.prepare();
        //this.simulation.seed_eprobots();
        this.simulation.drawer.paint_fast();

        this.frame_time = 1000 / this.simulation.settings.fps;
        console.log("frame_time: "+this.frame_time);
    }

    seed_eprobots(){
        this.simulation.seed_eprobots();
        this.simulation.drawer.paint_fast();
    }

    seed_eproboteaters(){
        this.simulation.seed_eproboteaters();
        this.simulation.drawer.paint_fast();
    }

    seed_energy(){
        this.simulation.seed_energy();
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
        console.log("click");

        let canvas_rect = controls["simulation_canvas"][0].getBoundingClientRect();
        var mousePos = this._get_mouse_pos(canvas_rect, e);

        // hot corner
        if (mousePos.x>=canvas_rect.width-30 && mousePos.y>=canvas_rect.height-30){
            this.toggle_fullscreen();
        }else if(mousePos.x>=canvas_rect.width-30 && mousePos.y<=30) {
            this.toggle_run();
        }
        else{
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, this.simulation.settings.world_width));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, this.simulation.settings.world_height));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            this.simulation.click_world(world_x, world_y, this.draw_mode);
        }

    }

    mousemove_canvas(e){
        //console.log("mousemove");
        if (this.mouse_down){
            this.mousedown_canvas(e);
        }
    }

    mouseup_canvas(e){
        console.log("mouseup");
        this.mouse_down = false;
    }

    mousedown_canvas(e){
        console.log("mousedown");
        this.mouse_down=true;

        let canvas_rect = controls["simulation_canvas"][0].getBoundingClientRect();
        var mousePos = this._get_mouse_pos(canvas_rect, e);

        // hot corner
        if (mousePos.x>=canvas_rect.width-30 && mousePos.y>=canvas_rect.height-30){
            this.toggle_fullscreen();
        }else if(mousePos.x>=canvas_rect.width-30 && mousePos.y<=30) {
            this.toggle_run();
        }
        else{
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, this.simulation.settings.world_width));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, this.simulation.settings.world_height));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            this.simulation.click_world(world_x, world_y, this.draw_mode);
        }
    }

    click_simitem_selector(id){
        console.log(id + " selektiert");
        this._set_draw_mode(id);
    }

    on_fullscreen_change() {
        //console.log("fullscreen change");
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