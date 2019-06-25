class EprobotBase {

    constructor(s, program, init_data, kind) {
        this.position = null;

        this.kind = kind;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.energy = 0;
        this.water = 0;
        this.life_counter = s.settings.eprobots_lifetime;

        this.program = program;

        this.init_data = init_data;
        this.working_data = init_data.slice(0);

        this.tail = [];

        this.s.stats_incr("eprobots_created");
    }

    //toJSON(){
    //    return {
    //        id: this.get_id(),
    //        tick: this.tick,
    //        life_counter: this.life_counter,
    //        energy: this.energy,
    //        x_pos: this.t.x,
    //        y_pos: this.t.y,
    //
    //        program: this.program,
    //        init_data: this.init_data,
    //        working_data: this.working_data
    //    };
    //}

    get_fork_energy() {
        return 1;
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

    set_input(){
        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=0;i<amount;i++){
            var current_frame_end = (i+1)*this.s.settings.DATA_INOUT_INTERVAL;

            let t = this.s.world.get_terrain(this.position.x, this.position.y);
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
}