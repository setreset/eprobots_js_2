class Eprobot{

    constructor(s, program, init_data, kind, energy) {
        this.position = null;

        this.kind = kind;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.energy = energy;
        this.water = 0;
        this.can_fork = true;

        if (this.kind==0){
            this.special_energy_consume = 1;
        }else if(this.kind==1){
            this.special_energy_consume = 0;
        }

        this.program = program;

        this.init_data = init_data;
        this.working_data = init_data.slice(0);

        this.tail = [];

        this.s.stats_incr("eprobots_created");
    }

    map_output_val(val, number_of_values){
        if (isFinite(val)){
            var mapped_val = Math.abs(val) % (number_of_values);
        }else{
            if (val==-Infinity){
                this.s.stats_incr("infinity_negative");
            }else if (val==Infinity){
                this.s.stats_incr("infinity_positive");
            }else if (isNaN(val)){
                this.s.stats_incr("infinity_nan");
            }else{
                log("Infinite: "+val);
            }

            var mapped_val = tools_random(number_of_values);
        }
        return mapped_val;
    }

    get_output_val(mem_index){
        var out_val = this.working_data[mem_index];

        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=1;i<amount;i++){
            //out_val = out_val ^ this.working_data[(i+mem_index)*this.s.settings.DATA_INOUT_INTERVAL];
            out_val = out_val ^ this.working_data[(i*this.s.settings.DATA_INOUT_INTERVAL)+mem_index];
        }

        return out_val;
    }

    clone_eprobot(){
        this.s.stats_incr("fork_clone");
        let new_program = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program);
        let new_data = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data);
        return [new_program, new_data];
    }

    set_input(){
        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=0;i<amount;i++){
            var current_frame_end = (i+1)*this.s.settings.DATA_INOUT_INTERVAL;

            let t = this.s.world.get_terrain(this.position.x, this.position.y);
            let can_fork=0;
            if (this.s.world.counter_eprobot[this.kind]<this.get_individuum_max()){
                can_fork=1;
            }
            this.working_data[current_frame_end-14] = can_fork;
            this.working_data[current_frame_end-13] = t.odor_eprobot;
            this.working_data[current_frame_end-12] = t.odor_barrier;
            this.working_data[current_frame_end-11] = t.odor_plant;
            this.working_data[current_frame_end-10] = t.info;
            this.working_data[current_frame_end-9] = t.poison;
            this.working_data[current_frame_end-8] = t.trace_eprobot;
            this.working_data[current_frame_end-7] = t.trace_eproboteater;

            if (t.energy_object) {
                if (t.energy_object.get_id() == OBJECTTYPES.PLANT.id){
                    this.working_data[current_frame_end - 6] = 1;
                } else if (t.energy_object.get_id() == OBJECTTYPES.WATER.id){
                    this.working_data[current_frame_end - 6] = 2;
                }
            }else{
                this.working_data[current_frame_end-6] = 0;
            }

            this.working_data[current_frame_end-5] = this.tick;
            this.working_data[current_frame_end-4] = this.energy;
            this.working_data[current_frame_end-3] = this.water;
            this.working_data[current_frame_end-2] = this.position.x;
            this.working_data[current_frame_end-1] = this.position.y;
        }
    }

    get_individuum_max() {
        return parseInt(this.s.settings.eprobots_max / this.s.settings.concurrency);
    }

    get_id(){
        return OBJECTTYPES.EPROBOT.id;
    }

    get_color(){
        let color = this.s.get_base_color_eprobot(this.kind);
        return "hsl("+color+", 100%, 48%)";
        //return OBJECTTYPES.EPROBOT.color[this.s.settings.colortheme];
    }

    get_output_OISC(){
        let steps = tools_compute(this.program, this.working_data, this.s.settings.PROGRAM_STEPS_MAX);

        if (steps>=this.s.settings.PROGRAM_STEPS_MAX){
            this.s.stats_incr("high_stepcounter");
        }

        /*this.s.stats_add("mean_sum", steps);
        this.s.stats_incr("mean_amount");
        if (Math.random()>0.9999){
            console.log("Steps: "+steps);
            console.log("Steps mean: "+this.s.stats["mean_sum"]/this.s.stats["mean_amount"]);
        }*/

        let penalty = parseInt(steps/this.s.settings.PROGRAM_STEPS_FOR_FREE);
        this.energy = this.energy - penalty;

        let moveval_raw = this.get_output_val(0);
        let moveval = this.map_output_val(moveval_raw, DIRECTIONS.length + 1);

        let fork_raw = this.get_output_val(1);
        let forkval = this.map_output_val(fork_raw, 2);

        let energydrop_raw = this.get_output_val(2);
        let energyval = this.map_output_val(energydrop_raw, 2);

        //let poison_raw = this.get_output_val(1);
        //let poisonval = this.map_output_val(poison_raw, 2);
        //
        //let info_raw = this.get_output_val(2);
        //let infoval = this.map_output_val(info_raw, 11);
        //
        //let sfs_raw = this.get_output_val(3);
        //let sfsval = this.map_output_val(sfs_raw, 3);

        //return [moveval, poisonval, infoval, sfsval];
        return [moveval, forkval, energyval];
    }

    move(new_pos_x, new_pos_y){
        let old_t = this.s.world.get_terrain(this.position.x, this.position.y);

        let old_pos_x = this.position.x;
        let old_pos_y = this.position.y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        if (this.s.settings.feature_traces){
            old_t.trace_eprobot = Math.min(old_t.trace_eprobot+200,5000);
            old_t.trace_eprobot_expiry = this.s.steps + 1000;
        }

        old_t.tail_eprobot[this.kind] += 1;
        this.tail.push({"t": old_t, "rt": this.tick+this.s.settings.TAIL_LENGTH});

        this.s.drawer.refresh_paintobj(old_t.x, old_t.y, old_t.get_color());
    }

    step(){
        //let moveval = this.get_move();
        let output = this.get_output_OISC();
        let moveval = output[0];
        let forkval = output[1];
        let dropval = output[2];
        //let poisonval = output[1];
        //let infoval = output[2];
        //let sfsval = output[3];

        // move
        if (this.energy > 0 && moveval<DIRECTIONS.length){
            let vec = DIRECTIONS[moveval];
            let movepos_x = this.position.x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
            let movepos_y = this.position.y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);

            let t = this.s.world.get_terrain(movepos_x, movepos_y);
            if (t.get_slot_object() == null && t.special_energy[this.kind]==0){
                let energy_object = t.get_energy_object();
                if (energy_object){
                    if (energy_object.get_id()==OBJECTTYPES.PLANT.id){
                        //slot_object.kill();
                        this.energy+=this.s.settings.energy_profit_plant;
                        energy_object.energy_count--;
                        if (energy_object.energy_count==0){
                            energy_object.is_dead=true;
                            this.s.world.world_unset_energy(movepos_x, movepos_y, energy_object);
                            //console.log(new Date()+": entferne pflanze");
                        }
                    }
                }

                if (t.special_energy[this.special_energy_consume]>0){
                    this.energy+=this.s.settings.energy_profit_plant;
                    t.special_energy[this.special_energy_consume]--;
                }

                this.move(movepos_x, movepos_y);
                this.energy--;
            }
        }

        this.can_fork = forkval==1 ? true : false;

        let t = this.s.world.get_terrain(this.position.x, this.position.y);

        if (dropval==1){
            if (t.special_energy[this.kind]==0){
                t.special_energy[this.kind]++;
                this.energy -= 20;
            }
        }

        if (this.s.settings.feature_poison && poisonval==1){
            t.poison++;
            t.poison_expiry = this.s.steps + 10000;
            this.energy -= 20;
        }

        if (this.s.settings.feature_info && infoval < 10){
            this.s.stats_incr("info");
            t.info = infoval;
            t.info_expiry = this.s.steps + 1000;
        }

        if (this.s.settings.feature_shared_food_storage && sfsval == 1){
            this.s.stats_incr("storage_put");
            if (this.energy>0){
                this.s.world.shared_food_storage++;
                this.energy--;
            }
        }

        if (this.s.settings.feature_shared_food_storage && sfsval == 2){
            this.s.stats_incr("storage_get");
            if (this.s.world.shared_food_storage>0){
                this.energy++;
                this.s.world.shared_food_storage--;
            }
        }

        if (this.tail.length>0){
            if (this.tail[0].rt<=this.tick){
                let to = this.tail.shift();
                let t = to.t;
                t.tail_eprobot[this.kind] = Math.max(t.tail_eprobot[this.kind]-1, 0);
                this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
            }
        }

        this.tick++;
        this.energy--;
    }

    fork(){
        // new eprobot
        let new_eprobot = null;
        let spreadval = tools_random(8);
        let vec = DIRECTIONS[spreadval];
        let spreadpos_x = this.position.x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
        let spreadpos_y = this.position.y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);
        //let spreadpos_x = this.s.settings.nest_x+tools_random2(-20,20);
        //let spreadpos_y = this.s.settings.nest_y+tools_random2(-20,20);
        let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (spreadterrain.slot_object == null){

            let new_program, new_data;

            if (tools_random(2)==1){
                // search eprobot next to me
                let co_eprobots = [];
                let box = 10;
                for (let co_eprobot of this.s.list_eprobots[this.kind]) {
                    if (co_eprobot==this){
                        continue;
                    }
                    if (co_eprobot.position.x>this.position.x-box && co_eprobot.position.x<this.position.x+box){
                        if (co_eprobot.position.y>this.position.y-box && co_eprobot.position.y<this.position.y+box){
                            co_eprobots.push(co_eprobot);
                        }
                    }
                }
                if (co_eprobots.length>0){
                    this.s.stats_incr("fork_crossover");

                    let random_index = tools_random(co_eprobots.length);
                    // absteigend sortieren
                    //co_eprobots.sort(function(a, b){return b.energy - a.energy});
                    new_program = tools_crossover(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program, co_eprobots[random_index].program);
                    new_data = tools_crossover(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data, co_eprobots[random_index].init_data);
                }else{
                    let r = this.clone_eprobot();
                    new_program = r[0];
                    new_data = r[1];
                }
            }else{
                let r = this.clone_eprobot();
                new_program = r[0];
                new_data = r[1];
            }

            let energy_for_child = this.s.settings.energy_start;

            if (this.energy>this.s.settings.energy_level_fork){
                let extra_energy = parseInt((this.energy-this.s.settings.energy_level_fork)/10);
                energy_for_child += extra_energy;
            }

            this.energy = this.energy - energy_for_child;

            new_eprobot = new Eprobot(this.s, new_program, new_data, this.kind, energy_for_child);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);

            if (this.water>0){
                this.water--;
            }
        }
        return new_eprobot
    }

    get_fork_energy_level() {
        return this.s.settings.energy_level_fork;
    }

    fork_ready(){
        return this.energy > this.get_fork_energy_level() && this.can_fork;
    }

    kill(){
        this.is_dead=true;
        for (let to of this.tail) {
            let t = to.t;
            t.tail_eprobot[this.kind] = Math.max(t.tail_eprobot[this.kind]-1, 0);
            this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
        }
    }

    set_odor_fields(){
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position.x + v.x, this.position.y + v.y);
            t.odor_eprobot++;
        }
    }

    unset_odor_fields(){
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position.x + v.x, this.position.y + v.y);
            t.odor_eprobot--;
        }
    }
}