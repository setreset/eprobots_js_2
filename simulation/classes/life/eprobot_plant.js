class EprobotPlant{
    static seed(s, eprobot_config){
        let eprobot_class = eprobot_classes[eprobot_config.eprobot_class];
        return new eprobot_class(s, eprobot_config);
    }

    constructor(s, config) {
        this.position_x = null;
        this.position_y = null;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.config = config;
		this.lifetime = this.config.lifetime_max+tools_random2(-this.config.lifetime_max/4,this.config.lifetime_max/4);
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
        let spreadpos_x = this.position_x + vec.x;
        let spreadpos_y = this.position_y + vec.y;
        let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        // plant wächst nicht dort, wo sich mindestens ein planteater oder ein ateeater befindet
        // und auch nicht da wo schon mehr als eine pflanze in der nähe ist
        if (spreadterrain.slot_object == null && spreadterrain.deadtrace_eprobot_plant == 0 && spreadterrain.odor_eprobot_planteater == 0 && spreadterrain.odor_eprobot_ateeater == 0 && spreadterrain.odor_eprobot_plant <= 1){
            let eprobot_class = eprobot_classes[this.config.eprobot_class];
            new_eprobot = new eprobot_class(this.s, this.config);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
        }
        return new_eprobot
    }

    fork_ready(){
        return true;//this.tick > 100;
    }

    kill(){
        this.is_dead=true;

        let t = this.s.world.get_terrain(this.position_x, this.position_y);
        t["deadtrace_"+this.config.eprobot_key]++;
    }

    set_odor_fields(){
        let t_pos = this.s.world.get_terrain(this.position_x, this.position_y);
        t_pos["odor_"+this.config.eprobot_key]+=2;

        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position_x + v.x, this.position_y + v.y);
            t["odor_"+this.config.eprobot_key]++;
        }
    }

    unset_odor_fields(){
        let t_pos = this.s.world.get_terrain(this.position_x, this.position_y);
        t_pos["odor_"+this.config.eprobot_key]-=2;

        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position_x + v.x, this.position_y + v.y);
            t["odor_"+this.config.eprobot_key]--;
        }
    }

    is_living(){
        return this.tick <= this.lifetime;
    }
}

eprobot_classes["eprobot_plant"] = EprobotPlant;