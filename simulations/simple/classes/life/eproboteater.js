class EprobotEater {

    constructor(s, program, init_data) {
        this.t = null;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.energy = 0;
        this.water = 0;
        this.life_counter = s.settings.eprobots_lifetime;

        this.program = program;

        this.init_data = init_data;
        this.working_data = init_data.slice(0);

        this.my_color = tools_random(359);
        this.afterstep_trace = null;

        this.s.stats_incr("eproboteaters_created");
    }

    toJSON(){
        return {
            id: this.get_id(),
            tick: this.tick,
            life_counter: this.life_counter,
            energy: this.energy,
            x_pos: this.t.x,
            y_pos: this.t.y,

            program: this.program,
            init_data: this.init_data,
            working_data: this.working_data
        };
    }

    get_id(){
        return OBJECTTYPES.EPROBOTEATER.id;
    }

    get_relative_life_time(max){
        return parseInt(tools_map_range(this.tick, 0, this.s.settings.eprobots_lifetime, 0, max));
    }

    get_color(){
        //var color = "hsl("+parseInt(this.tick/16)%360+", 100%, 48%)";

        //var s = parseInt(tools_map_range(this.tick, 0, this.s.settings.eprobots_lifetime, 100, 0));
        //var color = "hsl("+this.my_color+", "+s+"%, 48%)";

        //var l = parseInt(tools_map_range(this.tick, 0, this.s.settings.eprobots_lifetime, 48, 0));
        //var color = "hsl("+this.my_color+", 100%, "+l+"%, 0.5)";

        //var h = parseInt(tools_map_range(this.tick, 0, this.s.settings.eprobots_lifetime, 0, 360));
        //var color = "hsl("+h+", 100%, 48%)";

        //return h;
        return OBJECTTYPES.EPROBOTEATER.color;
    }

    get_lifetime(){
        return this.s.settings.eprobots_lifetime;
    }

    get_move(){
        return this.tick % (DIRECTIONS.length+1);
    }

    get_move_random(){
        return tools_random(DIRECTIONS.length+1);
    }

    get_move_OISC(){
        let steps = tools_compute(this.program, this.working_data, this.s.settings.PROGRAM_STEPS);

        if (steps>=this.s.settings.PROGRAM_STEPS){
            this.s.stats_incr("high_stepcounter");
        }

        let penalty = parseInt(steps/100);
        this.life_counter = this.life_counter - penalty;

        var move_val = this.working_data[0];

        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=1;i<amount;i++){
            move_val = move_val ^ this.working_data[i*this.s.settings.DATA_INOUT_INTERVAL];
        }

        if (isFinite(move_val)){
            var moveval = Math.abs(move_val) % (DIRECTIONS.length + 1);
        }else{
            if (move_val==-Infinity){
                this.s.stats_incr("infinity_negative");
            }else if (move_val==Infinity){
                this.s.stats_incr("infinity_positive");
            }else if (isNaN(move_val)){
                this.s.stats_incr("infinity_nan");
            }else{
                console.log("Infinite: "+move_val);
            }

            var moveval = this.get_move_random();
        }

        return moveval;
    }

    move(new_pos_x, new_pos_y){
        let old_pos_x = this.t.x;
        let old_pos_y = this.t.y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        this.afterstep_trace = new TraceEprobotEater(this.s, this.get_relative_life_time(10));
        this.s.world.world_set_trace_eproboteater(this.afterstep_trace, old_pos_x, old_pos_y);
    }

    set_input(){
        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=0;i<amount;i++){
            var current_frame_end = (i+1)*this.s.settings.DATA_INOUT_INTERVAL;

            if (this.t.trace_object_eprobot){
                this.working_data[current_frame_end-8] = this.t.trace_object_eprobot.get_color()+1;
            }else{
                this.working_data[current_frame_end-8] = 0;
            }

            if (this.t.trace_object_eproboteater){
                this.working_data[current_frame_end-7] = this.t.trace_object_eproboteater.get_color()+1;
            }else{
                this.working_data[current_frame_end-7] = 0;
            }

            if (this.t.energy_object) {
                if (this.t.energy_object.get_id() == OBJECTTYPES.PLANT.id){
                    this.working_data[current_frame_end - 6] = 1;
                } else if (this.t.energy_object.get_id() == OBJECTTYPES.WATER.id){
                    this.working_data[current_frame_end - 6] = 2;
                }
            }else{
                this.working_data[current_frame_end-6] = 0;
            }

            this.working_data[current_frame_end-5] = this.tick;
            this.working_data[current_frame_end-4] = this.energy;
            this.working_data[current_frame_end-3] = this.water;
            this.working_data[current_frame_end-2] = this.t.x;
            this.working_data[current_frame_end-1] = this.t.y;
        }
    }

    step(){
        //let moveval = this.get_move();
        this.afterstep_trace = null;
        let moveval = this.get_move_OISC();

        // move
        if (moveval<DIRECTIONS.length){
            let vec = DIRECTIONS[moveval];
            let movepos_x = this.s.correct_pos_width(this.t.x + vec.x);
            let movepos_y = this.s.correct_pos_height(this.t.y + vec.y);

            let t = this.s.world.get_terrain(movepos_x, movepos_y);
            let slot_object = t.get_slot_object();
            if (slot_object == null || slot_object.get_id()==OBJECTTYPES.EPROBOT.id){
                if (slot_object){
                    //slot_object.kill();
                    this.s.stats_incr("eprobot_kills");
                    this.energy++;
                    slot_object.is_dead=true;
                    this.s.world.world_unset(movepos_x, movepos_y, slot_object.get_id());
                }

                this.move(movepos_x, movepos_y);
            }
        }

        this.tick++;
        this.life_counter--;
    }

    fork(){
        // new eprobot
        let new_eprobot = null;
        let spreadval = tools_random(8);
        let vec = DIRECTIONS[spreadval];
        let spreadpos_x = this.s.correct_pos_width(this.t.x + vec.x);
        let spreadpos_y = this.s.correct_pos_height(this.t.y + vec.y);
        //let spreadpos_x = this.s.settings.nest_x+tools_random2(-20,20);
        //let spreadpos_y = this.s.settings.nest_y+tools_random2(-20,20);
        let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (spreadterrain.slot_object == null){
            var new_program = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program);
            var new_data = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data);
            new_eprobot = new EprobotEater(this.s, new_program, new_data);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
            this.energy = this.energy-1;
            if (this.water>0){
                this.water--;
            }
        }
        return new_eprobot
    }
}