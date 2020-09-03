var sim;
var eprobot_classes = {};

class Controller {
    constructor() {
        this.running = false;
        this.draw_mode = null;
        this.mouse_down = false;

        this.settings = Object.assign({}, settings_init);
        var settings_json = JSON.stringify(this.settings, null, '  ');
        controls["textbox_settings"].val(settings_json);

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
        log("controller: start_simulation");
        this.time_start = new Date();

        this.running = true;

        this.simulation_loop();
    }

    control_simulation_size(st){
        if (this.simulation.steps % 100 == 0){
            log("st: "+st+ " counter_eprobots: " + this.simulation.world.counter_eprobot_all());
            if (st > 2){
                if (this.simulation.world.counter_eprobot_all()>this.simulation.settings.eprobots_max-10){
                    this.simulation.settings.eprobots_max = Math.min(this.simulation.settings.eprobots_max+5, 10000);
                    log("increase eprobots_max: "+this.simulation.settings.eprobots_max);
                }
            }else if(st < 1){
                this.simulation.settings.eprobots_max = Math.max(this.simulation.settings.eprobots_max-5, 100);
                log("reduce eprobots_max: "+this.simulation.settings.eprobots_max);
            }
        }
    }

    control_number_of_plants(st) {
        //szenario


        if (this.simulation.steps % 1000 == 0) {
            if (this.simulation.world.counter_eprobot_ateeater < simconfig[1].individuals_max - 100) {
                simconfig[0].individuals_max += 6;
                log("erhoehe plants:" + simconfig[0].individuals_max);
            } else {
                simconfig[0].individuals_max -= 6;
                log("reduziere plants:" + simconfig[0].individuals_max);
            }
        }
    }

    simulation_loop(){
        let steptime_start = new Date().getTime();

        this.simulation.simulation_prestep();
        this.simulation.simulation_step();

        this.simulation.drawer.paint_fast();

        let steptime_end = new Date().getTime();
        let current_frame_time = steptime_end - steptime_start;

        if (this.running) {
            let st = this.simulation.settings.frame_time - current_frame_time;

            //this.control_simulation_size(st);
            //this.control_number_of_plants();

            //szenario
            /*if (this.simulation.steps%10000==0){
                if (this.simulation.world.counter_eprobot_all()==0){
                    this.reset_simulation();
                    this.settings.plants_max = settings_init.plants_max;
                }else{
                    this.settings.plants_max-=12;
                    log("reduziere plants:" + this.settings.plants_max);
                }
            }*/

            /*if (this.simulation.steps%1000==0){
                if (this.simulation.world.counter_eprobot_all()<this.settings.eprobots_max-100){
                    this.settings.plants_max+=6;
                    log("erhoehe plants:" + this.settings.plants_max);
                }else{
                    this.settings.plants_max-=6;
                    log("reduziere plants:" + this.settings.plants_max);
                }
            }*/

            setTimeout(()=>{this.simulation_loop()}, st);
        }
    }

    stop_simulation(){
        log("controller: stop_simulation");
        this.running = false;
    }

    init_simulation(){
        let canvas = controls["simulation_canvas"][0];
        //let canvas2 = controls["simulation_canvas2"][0];
        this.simulation = new Simulation(canvas, simconfig);
        sim = this.simulation;
        this.simulation.init(this.settings);
        //this.simulation.prepare();
        //this.simulation.seed_eprobots();

        this.simulation.drawer.paint_fast();
    }

    reset_simulation(){
        log("controller: reset_simulation");
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
        log("click");

        let canvas_rect = controls["simulation_canvas"][0].getBoundingClientRect();
        var mousePos = this._get_mouse_pos(canvas_rect, e);

        // hot corner
        if (mousePos.x>=canvas_rect.width-30 && mousePos.y>=canvas_rect.height-30){
            this.toggle_fullscreen();
        }else if(mousePos.x>=canvas_rect.width-30 && mousePos.y<=30) {
            this.toggle_run();
        }
        else{
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, this.simulation.world_width_visible));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, this.simulation.world_height_visible));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            this.simulation.click_world(world_x+1, world_y+1, this.draw_mode);
        }

    }

    mousemove_canvas(e){
        //console.log("mousemove");
        if (this.mouse_down){
            this.mousedown_canvas(e);
        }
    }

    mouseup_canvas(e){
        log("mouseup");
        this.mouse_down = false;
    }

    mousedown_canvas(e){
        log("mousedown");
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
            let world_x = parseInt(tools_map_range(mousePos.x,0,canvas_rect.width, 0, this.simulation.world_width));
            let world_y = parseInt(tools_map_range(mousePos.y,0,canvas_rect.height, 0, this.simulation.world_height));
            //console.log("x_world:" + world_x + " y_world:" + world_y);
            this.simulation.click_world(world_x, world_y, this.draw_mode);
        }
    }

    click_simitem_selector(id){
        log(id + " selektiert");
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

    click_set_settings(){
        let settings_json = controls["textbox_settings"].val();
        this.settings = JSON.parse(settings_json);
        this.simulation.set_settings(this.settings);
    }

    click_load(){
        //var simsavestate = controls["textbox_simsavestate"].val();
        //var simsavestateobj = JSON.parse(simsavestate);
        //
        //// neue simulation initialisieren
        //this.simulation = new Simulation(controls["simulation_canvas"][0], controls["simulation_canvas2"][0]);
        //this.simulation.loadState(simsavestateobj);
        //
        //this.simulation.drawer.paint_fast();
        ////simulation.drawer.paint_full();
    }

    click_save(){
        //var simsavestate = JSON.stringify(this.simulation);
        ////var simsavestate = JSON.stringify(simulation, null, '  ');
        //controls["textbox_simsavestate"].val(simsavestate);
    }

    click_load_from_ls(){
        //var simsavestate_compressed = localStorage.getItem('simsavestate_compressed');
        //var simsavestate = LZString.decompress(simsavestate_compressed);
        //
        //var simsavestateobj = JSON.parse(simsavestate);
        //
        //// neue simulation initialisieren
        //this.simulation = new Simulation(controls["simulation_canvas"][0], controls["simulation_canvas2"][0]);
        //this.simulation.loadState(simsavestateobj);
        //
        //this.simulation.drawer.paint_fast();
    }

    click_save_to_ls(){
        //var simsavestate = JSON.stringify(this.simulation);
        //log(simsavestate.length);
        //var simsavestate_compressed = LZString.compress(simsavestate);
        //log(simsavestate_compressed.length);
        //try{
        //    localStorage.setItem("simsavestate_compressed", simsavestate_compressed);
        //}catch(err){
        //    alert("Error: "+err);
        //}
    }

    get_object_types(){
        return this.simulation.get_object_types();
    }

    get_colortheme(){
        return this.simulation.settings.colortheme;
    }
}