class EprobotBase{

    static seed(s, eprobot_config){
        var program = [];
        for (var pi = 0; pi < s.settings.PROGRAM_LENGTH; pi++) {
            var val = tools_random(s.settings.PROGRAM_LENGTH * 10) - s.settings.PROGRAM_LENGTH;
            program.push(val);
        }

        var init_data = [];
        for (var di = 0; di < s.settings.DATA_LENGTH; di++) {
            var val = tools_random2(-720, 720);
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

            let t = this.s.world.get_terrain(this.position_x, this.position_y);

            // entfernt: ob forken in hinblick auf get_individuum_max überhaupt möglich ist
            //this.working_data[current_frame_end-11] = t.odor_eprobot;
            //this.working_data[current_frame_end-8] = t.info;
            //this.working_data[current_frame_end-7] = t.poison;
            //this.working_data[current_frame_end-6] = t.trace_eprobot;

            //this.working_data[current_frame_end-6] = t.odor_barrier;
            //this.working_data[current_frame_end-8] = t.deadtrace_eprobot_plant;
            this.working_data[current_frame_end-8] = t.odor_eprobot;
            this.working_data[current_frame_end-7] = t.odor_eprobot_eater;
            this.working_data[current_frame_end-6] = t.odor_eprobot_ateeater;
            this.working_data[current_frame_end-5] = t.odor_eprobot_plant;
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


        return [moveval];
    }

    action_hook(output){

    }

    step(){
        //let moveval = this.get_move();
        let output = this.get_output_OISC();
        let moveval = output[0];
        //let forkval = output[1];
        //let poisonval = output[1];
        //let infoval = output[2];
        //let sfsval = output[3];

        // move
        if (this.energy > 0 && moveval<DIRECTIONS.length){
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

        this.tick++;
        this.energy--;
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

            //if (tools_random(2)==1){
            //    // search eprobot next to me
            //    let co_eprobots = [];
            //    let box = 10;
            //    for (let co_eprobot of this.s["list_"+this.config.eprobot_key]) {
            //        if (co_eprobot==this){
            //            continue;
            //        }
            //        if (co_eprobot.position.x>this.position.x-box && co_eprobot.position.x<this.position.x+box){
            //            if (co_eprobot.position.y>this.position.y-box && co_eprobot.position.y<this.position.y+box){
            //                co_eprobots.push(co_eprobot);
            //            }
            //        }
            //    }
            //    if (co_eprobots.length>0){
            //        this.s.stats_incr("fork_crossover");
            //
            //        let random_index = tools_random(co_eprobots.length);
            //        // absteigend sortieren
            //        //co_eprobots.sort(function(a, b){return b.energy - a.energy});
            //        new_program = tools_crossover(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program, co_eprobots[random_index].program);
            //        new_data = tools_crossover(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data, co_eprobots[random_index].init_data);
            //    }else{
            //        let r = this.clone_eprobot();
            //        new_program = r[0];
            //        new_data = r[1];
            //    }
            //}else{
            //    let r = this.clone_eprobot();
            //    new_program = r[0];
            //    new_data = r[1];
            //}

            let r = this.clone_eprobot();
            new_program = r[0];
            new_data = r[1];

            let energy_for_child = this.config.energy_start;

            if (this.energy>this.config.energy_level_fork){
                let extra_energy = parseInt((this.energy-this.config.energy_level_fork)/10);
                energy_for_child += extra_energy;
            }

            this.energy = this.energy - energy_for_child;

            let eprobot_class = eprobot_classes[this.config.eprobot_class];
            new_eprobot = new eprobot_class(this.s, new_program, new_data, energy_for_child, this.config);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
        }
        return new_eprobot
    }

    fork_ready(){
        return this.energy > this.config.energy_level_fork;
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
        return this.tick <= this.config.lifetime_max && this.energy > 0;
    }
}