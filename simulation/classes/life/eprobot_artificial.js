class EprobotArtificial{
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

        this.tail = [];
        this.enemy_detection = false;
        this.enemy_stop = 0;
        this.enemy_direction = 0;
    }

    set_input(){

    }

    get_individuum_max() {
        return this.config.individuals_max;
    }

    get_id(){
        return OBJECTTYPES.EPROBOT.id;
    }

    get_color(){
        let color = this.config.base_color;
        return "hsl("+color+", 100%, 48%)";
        //return OBJECTTYPES.EPROBOT.color[this.s.settings.colortheme];
    }

    try_move(t_new){
        let slot_object = t_new.get_slot_object();
        if (slot_object){
            if (slot_object.get_id()==OBJECTTYPES.BARRIER.id){
                this.kill();
                this.s.world.world_unset(this.position_x, this.position_y, this);
            }
        }else{
            this.move(t_new.x, t_new.y);
            this.energy--;
        }
    }

    move(new_pos_x, new_pos_y){
        let old_t = this.s.world.get_terrain(this.position_x, this.position_y);

        let old_pos_x = this.position_x;
        let old_pos_y = this.position_y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        old_t["tail_"+this.config.eprobot_key] += 1;
        this.tail.push({"t": old_t, "rt": this.tick+this.s.settings.TAIL_LENGTH});

        old_t.prepare_paint();
    }

    step(){
        let t = this.s.world.get_terrain(this.position_x, this.position_y);
        if (t.odor_eprobot_eater>0){
            this.enemy_detection=true;
            this.enemy_stop = this.tick+100;
            this.enemy_direction = tools_random(8);
        }

        let moveval;
        if (this.enemy_detection){
            moveval = this.enemy_direction;
            if (this.tick == this.enemy_stop){
                this.enemy_detection = false;
            }
        }else{
            //moveval = tools_random(9);
        }


        // move
        if (moveval<DIRECTIONS.length){
            let vec = DIRECTIONS[moveval];
            let movepos_x = this.position_x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
            let movepos_y = this.position_y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);

            let t_new = this.s.world.get_terrain(movepos_x, movepos_y);

            // eat
            //this.try_eat(t_new);

            // move
            this.try_move(t_new);
        }

        if (this.tail.length>0){
            if (this.tail[0].rt<=this.tick){
                let to = this.tail.shift();
                let t = to.t;
                t["tail_"+this.config.eprobot_key] = Math.max(t["tail_"+this.config.eprobot_key]-1, 0);
                t.prepare_paint();
            }
        }

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
        if (spreadterrain.slot_object == null && spreadterrain.deadtrace_eprobot_plant == 0){
            let eprobot_class = eprobot_classes[this.config.eprobot_class];
            new_eprobot = new eprobot_class(this.s, this.config);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
        }
        return new_eprobot
    }

    fork_ready(){
        return false;//this.tick > 100;
    }

    kill(){
        this.is_dead=true;

        for (let to of this.tail) {
            let t = to.t;
            t["tail_"+this.config.eprobot_key] = Math.max(t["tail_"+this.config.eprobot_key]-1, 0);
            t.prepare_paint();
        }
    }

    set_odor_fields(){
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position_x + v.x, this.position_y + v.y);
            t["odor_"+this.config.eprobot_key]++;
        }
    }

    unset_odor_fields(){
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

eprobot_classes["eprobot_artificial"] = EprobotArtificial;