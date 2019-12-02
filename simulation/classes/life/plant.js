class Plant{
    static seed(s, eprobot_config){
        let eprobot_class = eprobot_classes[eprobot_config.eprobot_class];
        return new eprobot_class(s, eprobot_config);
    }

    constructor(s, config) {
        this.position = {x: null, y:null};

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.config = config;
    }

    set_input(){

    }

    get_individuum_max() {
        return this.config.individuals_max;
    }

    get_id(){
        return OBJECTTYPES.PLANT.id;
    }

    get_color(){
        let color = this.config.base_color;
        return "hsl("+color+", 100%, 48%)";
        //return OBJECTTYPES.EPROBOT.color[this.s.settings.colortheme];
    }

    step(){
        this.tick++;
    }

    fork(){
        // new eprobot
        let new_eprobot = null;
        let spreadval = tools_random(8);
        let vec = DIRECTIONS[spreadval];
        let spreadpos_x = this.position.x + vec.x;
        let spreadpos_y = this.position.y + vec.y;
        let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (spreadterrain.slot_object == null){
            let eprobot_class = eprobot_classes[this.config.eprobot_class];
            new_eprobot = new eprobot_class(this.s, this.config);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
        }
        return new_eprobot
    }

    fork_ready(){
        return this.tick > 100;
    }

    kill(){
        this.is_dead=true;
    }

    set_odor_fields(){
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position.x + v.x, this.position.y + v.y);
            t.odor_plant++;
        }
    }

    unset_odor_fields(){
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position.x + v.x, this.position.y + v.y);
            t.odor_plant--;
        }
    }

    is_living(){
        return this.tick <= 200;
    }
}

eprobot_classes["plant"] = Plant;