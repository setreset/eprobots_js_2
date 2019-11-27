class Simulation {

    constructor(canvas, simconfig) {
        this.canvas = canvas;

        this.simconfig = simconfig;

        this.steps = 0;

        sim = this;

        //create a synth and connect it to the master output (your speakers)
        this.synth = new Tone.Synth().toMaster();
    }

    prepare(){
        for (var i=0;i<this.world_height; i++){
            let b = new Barrier(this);
            this.world.world_set(b, this.world_width/2, i);
        }
    }

    stats_incr(key){
        if (key in this.stats){
            this.stats[key]++;
        }else{
            this.stats[key] = 1;
        }
    }

    stats_add(key, val){
        if (key in this.stats){
            this.stats[key] = this.stats[key] + val;
        }else{
            this.stats[key] = val;
        }
    }

    list_eprobots_init(){
        for (let eprobot_config of this.simconfig){
            this["list_"+eprobot_config.eprobot_key] = [];
        }
    }

    init(settings){
        this.settings = settings;

        let screensize_width = window.screen.width; // * window.devicePixelRatio;
        let screensize_height = window.screen.height; // * window.devicePixelRatio;
        log("devicePixelRatio: "+window.devicePixelRatio);
        log("resolution: "+screensize_width+"x"+screensize_height);
        // welt + 2 wegen umrandung mit barrien
        this.world_width = screensize_width/this.settings.world_divider+2;
        this.world_height = screensize_height/this.settings.world_divider+2;
        log("world dimensions: "+this.world_width+"x"+this.world_height);
        this.world_width_visible = this.world_width-2;
        this.world_height_visible = this.world_height-2;

        this.world = new World(this, this.world_width, this.world_height);
        this.drawer = new Drawer(this, this.canvas);

        this.reduce_traces_tries = parseInt((this.world_width * this.world_height)/518);
        log("reduce_traces_tries: "+this.reduce_traces_tries);

        this.list_eprobots_init();

        this.list_plants = [];
        this.stats = {};

        this.add_borders();
    }

    set_settings(new_settings){
        this.settings = new_settings;
    }

    add_borders(){
        for (let x=0;x<this.world_width;x++){
            let b = new Barrier(this);
            this.world.world_set(b, x, 0);

            let b2 = new Barrier(this);
            this.world.world_set(b2, x, this.world_height-1);
        }

        for (let y=1;y<this.world_height-1;y++){
            let b = new Barrier(this);
            this.world.world_set(b, 0, y);

            let b2 = new Barrier(this);
            this.world.world_set(b2, this.world_width-1, y);
        }
    }

    seed_eprobots(eprobot_config){
        log("seed_eprobots "+eprobot_config["eprobot_key"]);
        for (let i = 0; i<this.settings.SEED_EPROBOTS_NUMBER;i++){
            let x = tools_random(this.world_width);
            let y = tools_random(this.world_height);
            if (this.world.get_terrain(x,y).slot_object==null){
                let eprobot_class = eprobot_classes[eprobot_config.eprobot_class];
                let ep = eprobot_class.seed(this, eprobot_config);
                this.world.world_set(ep, x, y);
                this["list_"+eprobot_config.eprobot_key].push(ep);
            }
        }
    }

    seed_energy(){
        for (let i = 0; i<10;i++){
            let x = tools_random(this.world_width);
            let y = tools_random(this.world_height);

            x = Math.max(x, 50);
            x = Math.min(x, this.world_width-50);
            y = Math.max(y, 50);
            y = Math.min(y, this.world_height-50);

            if (this.world.get_terrain(x,y).energy_object==null){
                let p = new Plant(this);
                this.world.world_set_energy(p, x, y);
                this.list_plants.push(p);
            }
        }
    }

    simulation_prestep(){
        for (let eprobot_config of this.simconfig){
            if (this.world["counter_"+eprobot_config.eprobot_key] == 0) {
                this.seed_eprobots(eprobot_config);
            }
        }
    }

    reduce_traces_fast(){
        for (let i=0;i<this.reduce_traces_tries;i++){
            let x = tools_random(this.world_width);
            let y = tools_random(this.world_height);
            let cand_terrain = this.world.get_terrain(x,y);

            let reduced = false;

            if (cand_terrain.trace_eprobot > 0 && cand_terrain.trace_eprobot_expiry < this.steps){
                cand_terrain.trace_eprobot -= 200;
                if (cand_terrain.trace_eprobot<=0){
                    cand_terrain.trace_eprobot = 0;
                }
                reduced = true;
            }

            if (cand_terrain.poison > 0 && cand_terrain.poison_expiry < this.steps){
                cand_terrain.poison = 0;
                reduced = true;
            }

            if (cand_terrain.info > 0 && cand_terrain.info_expiry < this.steps){
                cand_terrain.info = 0;
                reduced = true;
            }

            if (reduced){
                this.drawer.refresh_paintobj(cand_terrain.x, cand_terrain.y, cand_terrain.get_color());
            }
        }
    }

    process_eprobots(list_eprobots){
        let list_eprobots_next = [];
        let eprobots_forkable = [];

        //shuffle(this.active_objects);

        for (let o of list_eprobots) {
            if (o.is_dead) continue;
            let living = o.is_living();

            if (living){
                // INPUT
                o.set_input();

                o.step();

                if (o.fork_ready()){
                    eprobots_forkable.push(o);
                }
                list_eprobots_next.push(o);

            }else{
                this.world.world_unset(o.position.x, o.position.y, o);
                o.kill();
                //let a = new Ate(this);
                //this.world.world_set(a, o.t.x, o.t.y);
            }
        }

        return {
            "list_eprobots_next": list_eprobots_next,
            "eprobots_forkable": eprobots_forkable
        };
    }

    fork_eprobots(eprobots_forkable, list_eprobots_next){
        for (let o of eprobots_forkable) {
            let new_eprobot = null;
            if (this.world["counter_"+ o.config.eprobot_key] < o.get_individuum_max()){
                new_eprobot = o.fork();
                if (new_eprobot){
                    play_tone(this.synth, o.config.note_create, 0.1, this.settings.SOUND);
                    list_eprobots_next.push(new_eprobot);
                }
            }else{
                break;
            }
        }
    }

    simulation_step(){
        for (let eprobot_config of this.simconfig){
            let r_eprobots = this.process_eprobots(this["list_"+eprobot_config.eprobot_key]);
            let eprobots_forkable = r_eprobots.eprobots_forkable;
            let list_eprobots_next = r_eprobots.list_eprobots_next;

            // fork
            this.fork_eprobots(eprobots_forkable, list_eprobots_next);
            this["list_"+eprobot_config.eprobot_key] = list_eprobots_next;
        }

        if (this.world.counter_plant > 0 && this.world.counter_plant < this.settings.plants_max){
            let list_plants_next = [];
            let plant_cnt = 0;
            let num_tries = this.settings.plants_max / 10;
            while(plant_cnt < num_tries && this.world.counter_plant < this.settings.plants_max){
                let cand_index = tools_random(this.list_plants.length);
                let cand_plant = this.list_plants[cand_index];
                if (cand_plant.is_dead){
                    this.list_plants.splice(cand_index, 1);
                }else{
                    let new_plant = cand_plant.fork();
                    if (new_plant){
                        list_plants_next.push(new_plant);
                    }
                }

                plant_cnt++;
            }
            this.list_plants.push(...list_plants_next);
        }

        // traces wegräumen
        if (this.settings.feature_traces || this.settings.feature_poison || this.settings.feature_info){
            this.reduce_traces_fast();
        }

        this.steps++;
    }

    correct_pos_width(x_pos){
        if (this.settings.beam_at_borders){
            if (x_pos>=0){
                return x_pos % this.world_width;
            }else{
                return this.world_width - (Math.abs(x_pos) % this.world_width);
            }
        }else{
            return Math.min(Math.max(0,x_pos), this.world_width-1);
        }

    }

    correct_pos_height(y_pos){
        if (this.settings.beam_at_borders) {
            if (y_pos >= 0) {
                return y_pos % this.world_height;
            } else {
                return this.world_height - (Math.abs(y_pos) % this.world_height);
            }
        }else{
            return Math.min(Math.max(0,y_pos), this.world_height-1);
        }
    }

    get_object_types(){
        return OBJECTTYPES;
    }

    click_world(world_x, world_y, draw_mode){
        let t = this.world.get_terrain(world_x, world_y);
        log("click_world");
        console.log(t);

        if (draw_mode == OBJECTTYPES.PLANT.id){
            if (t.energy_object == null){
                let p = new Plant(this);
                this.world.world_set_energy(p, world_x, world_y);
                this.list_plants.push(p);
                //simulation.active_objects.push(p);
                this.drawer.paint_fast();
            }else{
                log("besetzt");
            }
        }else if (draw_mode == OBJECTTYPES.BARRIER.id){
            if (t.slot_object == null){
                let b = new Barrier(this);
                this.world.world_set(b, world_x, world_y);
                //simulation.active_objects.push(p);
                this.drawer.paint_fast();
            }else{
                log("besetzt");
            }
        }
    }
}