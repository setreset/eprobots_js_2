class EprobotBase{

    static seed(s, eprobot_config){
        var program = [];
        for (var pi = 0; pi < s.settings.PROGRAM_LENGTH; pi++) {
            var val = s.simtools.get_init_val_program();
            program.push(val);
        }

        var init_data = [];
        for (var di = 0; di < s.settings.DATA_LENGTH; di++) {
            var val = s.simtools.get_init_val_data();
            init_data.push(val);
        }

        let eprobot_class = eprobot_classes[eprobot_config.eprobot_class];
        return new eprobot_class(s, program, init_data, eprobot_config.energy_start, eprobot_config);
    }

    constructor(s, program, init_data, energy, config) {
        this.position_x = null;
        this.position_y = null;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.config = config;
        this.energy = energy;

        this.program = program;

        this.init_data = init_data;
        this.working_data = init_data.slice(0);

        this.tail = [];

        this.s.stats_incr("eprobots_created");

        this.direction = 0;

        this.set_fork_ready = false;
    }

    map_output_val(val, number_of_values){
        return Math.abs(val) % (number_of_values);
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

    clone_eprobot(program, init_data){
        this.s.stats_incr("fork_clone");
        let mp = 0; //this.s.settings.MUTATE_POSSIBILITY;
        let rnd = Math.random();
        if (rnd<0.01){
            mp = 1.0;
        }else if (rnd<0.025){
            mp = 0.75;
        }else if (rnd<0.05){
            mp = 0.5;
        }else if (rnd<0.075){
            mp = 0.3;
        }else if (rnd<0.1){
            mp = this.s.settings.MUTATE_POSSIBILITY;
        }
        let new_program = this.s.simtools.get_mutated_copy__program(mp, program);
        let new_data = this.s.simtools.get_mutated_copy__data(mp, init_data);

        // deletion
        //this.s.simtools.mutation_deletion__program(this.s.settings.MUTATE_POSSIBILITY, new_program);
        //this.s.simtools.mutation_deletion__data(this.s.settings.MUTATE_POSSIBILITY, new_data);

        // translocation
        //this.s.simtools.mutation_translocation(this.s.settings.MUTATE_POSSIBILITY, new_program);
        //this.s.simtools.mutation_translocation(this.s.settings.MUTATE_POSSIBILITY, new_data);

        // duplication
        //this.s.simtools.mutation_duplication(this.s.settings.MUTATE_POSSIBILITY, new_program);
        //this.s.simtools.mutation_duplication(this.s.settings.MUTATE_POSSIBILITY, new_data);

        // inversion

        return [new_program, new_data];
    }

    set_input(){
        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=0;i<amount;i++){
            var current_frame_end = (i+1)*this.s.settings.DATA_INOUT_INTERVAL;

            let t = this.s.world.get_terrain(this.position_x, this.position_y);
            let tx = this.s.world.get_terrain(this.position_x + DIRECTIONS[this.direction].x, this.position_y + DIRECTIONS[this.direction].y);

            // entfernt: ob forken in hinblick auf get_individuum_max überhaupt möglich ist
            //this.working_data[current_frame_end-11] = t.odor_eprobot;
            //this.working_data[current_frame_end-8] = t.info;
            //this.working_data[current_frame_end-7] = t.poison;
            //this.working_data[current_frame_end-6] = t.trace_eprobot;

            //this.working_data[current_frame_end-6] = t.odor_barrier;
            //this.working_data[current_frame_end-8] = t.deadtrace_eprobot_plant;

            let idx = 6;

            for (let eprobot_config of this.s.simconfig){
                this.working_data[current_frame_end-idx] = t["odor_" + eprobot_config.eprobot_key];
                idx++;

                // direction
                this.working_data[current_frame_end-idx] = tx["odor_" + eprobot_config.eprobot_key];
                idx++;

                this.working_data[current_frame_end-idx] = tx.deadtrace_eprobot_plant;
                idx++;

                // umgebung
                //for (let v of DIRECTIONS) {
                //    let tx2 = this.s.world.get_terrain(this.position_x + v.x, this.position_y + v.y);
                //    this.working_data[current_frame_end-idx] = tx2["odor_" + eprobot_config.eprobot_key];
                //    idx++;
                //    this.working_data[current_frame_end - idx] = tx2["deadtrace_eprobot_plant"]
                //    idx++;
                //}
            }

            this.working_data[current_frame_end-5] = 0;
            this.working_data[current_frame_end-4] = this.tick;
            this.working_data[current_frame_end-3] = this.energy;
            this.working_data[current_frame_end-2] = this.position_x;
            this.working_data[current_frame_end-1] = this.position_y;
        }
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

    move(new_pos_x, new_pos_y){
        let old_t = this.s.world.get_terrain(this.position_x, this.position_y);

        let old_pos_x = this.position_x;
        let old_pos_y = this.position_y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        if (this.s.settings.feature_traces){
            old_t.trace_eprobot = Math.min(old_t.trace_eprobot+200,5000);
            old_t.trace_eprobot_expiry = this.s.steps + 1000;
        }

        old_t["tail_"+this.config.eprobot_key] += 1;
        this.tail.push({"t": old_t, "rt": this.tick+this.s.settings.TAIL_LENGTH});

        old_t.prepare_paint();
    }

    get_output_OISC(){
        let steps = tools_compute(this.program, this.working_data, this.s.settings.PROGRAM_STEPS_MAX);

        if (Math.random()<0.0001){
            //log(this.config.eprobot_key+" steps: "+steps);
            if (steps<=300){
                send_metric("steps_"+this.config.eprobot_key, steps);

                this.s.stats_incr("compute_calls");
                this.s.stats_add("compute_steps", steps);
                send_metric("steps_average", this.s.stats["compute_steps"]/this.s.stats["compute_calls"]);
            }
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

        let forkval_raw = this.get_output_val(1);
        let forkval = this.map_output_val(forkval_raw, 2);

        return [moveval, forkval];
    }

    action_hook(output){

    }

    step(){
        if (this.tick>=300){
            //let moveval = this.get_move();
            let output = this.get_output_OISC();
            let moveval = output[0];
            let forkval = output[1];
            //let poisonval = output[1];
            //let infoval = output[2];
            //let sfsval = output[3];

            // move
            if (this.energy > 0 && moveval<DIRECTIONS.length){
                this.direction = moveval;
                let vec = DIRECTIONS[moveval];
                let movepos_x = this.position_x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
                let movepos_y = this.position_y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);

                let t_new = this.s.world.get_terrain(movepos_x, movepos_y);

                // eat
                this.try_eat(t_new);

                // move
                this.try_move(t_new);
            }

            this.action_hook(output);

            let t = this.s.world.get_terrain(this.position_x, this.position_y);

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
                    t["tail_"+this.config.eprobot_key] = Math.max(t["tail_"+this.config.eprobot_key]-1, 0);
                    t.prepare_paint();
                }
            }


            this.energy--;

            if (forkval){
                this.set_fork_ready=true;
            }
        }

        this.tick++;
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

    fork(){
        // new eprobot
        let new_eprobot = null;
        let spreadval = tools_random(8);
        let vec = DIRECTIONS[spreadval];
        let spreadpos_x = this.position_x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
        let spreadpos_y = this.position_y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);
        //let spreadpos_x = this.s.settings.nest_x+tools_random2(-20,20);
        //let spreadpos_y = this.s.settings.nest_y+tools_random2(-20,20);
        let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (spreadterrain.slot_object == null){

            let new_program, new_data;

            if (tools_random(10)==10){
                // search eprobot next to me
                let co_eprobots = [];
                let box = 10;
                for (let co_eprobot of this.s["list_"+this.config.eprobot_key]) {
                    if (co_eprobot==this){
                        continue;
                    }
                    if (co_eprobot.position_x>this.position_x-box && co_eprobot.position_x<this.position_x+box){
                        if (co_eprobot.position_y>this.position_y-box && co_eprobot.position_y<this.position_y+box){
                            co_eprobots.push(co_eprobot);
                        }
                    }
                }
                if (co_eprobots.length>0){
                    this.s.stats_incr("fork_crossover");

                    let random_index = tools_random(co_eprobots.length);
                    // absteigend sortieren
                    //co_eprobots.sort(function(a, b){return b.energy - a.energy});
                    let new_program_crossed = tools_crossover(this.program, co_eprobots[random_index].program);
                    let new_data_crossed = tools_crossover(this.init_data, co_eprobots[random_index].init_data);
                    let r = this.clone_eprobot(new_program_crossed, new_data_crossed);
                    new_program = r[0];
                    new_data = r[1];
                }else{
                    let r = this.clone_eprobot(this.program, this.init_data);
                    new_program = r[0];
                    new_data = r[1];
                }
            }else{
                let r = this.clone_eprobot(this.program, this.init_data);
                new_program = r[0];
                new_data = r[1];
            }

            //let r = this.clone_eprobot();
            //new_program = r[0];
            //new_data = r[1];

            let energy_for_child = this.config.energy_start;

            if (this.energy>this.config.energy_level_fork){
                let extra_energy = parseInt((this.energy-this.config.energy_level_fork)/10);
                energy_for_child += extra_energy;
            }

            this.energy = this.energy - energy_for_child;

            let eprobot_class = eprobot_classes[this.config.eprobot_class];
            new_eprobot = new eprobot_class(this.s, new_program, new_data, energy_for_child, this.config);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
            this.set_fork_ready = false;
        }
        return new_eprobot
    }

    fork_ready(){
        return (this.energy > this.config.energy_level_fork && this.set_fork_ready);
    }

    kill(){
        this.is_dead=true;
        for (let to of this.tail) {
            let t = to.t;
            t["tail_"+this.config.eprobot_key] = Math.max(t["tail_"+this.config.eprobot_key]-1, 0);
            t.prepare_paint();
        }

        //let t = this.s.world.get_terrain(this.position_x, this.position_y);
        //t["deadtrace_"+this.config.eprobot_key]++;
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
        return this.tick <= this.config.lifetime_max && this.energy > 0;
    }
}