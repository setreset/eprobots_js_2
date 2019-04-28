class EprobotBase {

    constructor(s, program, init_data, m_pos, m_strength) {
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

        this.tail = [];

        this.s.stats_incr("eprobots_created");
        this.m_pos = m_pos;
        this.m_strength = m_strength;

        this.orientation = ORIENTATIONS.BOTTOM;
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
        //var out_val = this.working_data[this.s.settings.DATA_INOUT_INTERVAL+mem_index];

        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=1;i<amount;i++){
            //out_val = out_val ^ this.working_data[(i+mem_index)*this.s.settings.DATA_INOUT_INTERVAL];
            out_val = out_val ^ this.working_data[(i*this.s.settings.DATA_INOUT_INTERVAL)+mem_index];
        }

        return out_val;
    }

    get_sightval(){
        // get terrain
        let vec = DIRECTIONS[this.orientation];
        let sightpos_x = this.t.x + vec.x;
        let sightpos_y = this.t.y + vec.y;

        let sightval_energy_object = -1;
        let sightval_slot_object = -1;
        let sightval_trace_eproboteater = -1;
        let sightval_trace_eprobot = -1;
        let sightval_tail_eproboteater = -1;
        let sightval_tail_eprobot = -1;
        let sightval_poison = -1;
        let sightval_info = -1;

        if (sightpos_x>=0 && sightpos_x<this.s.settings.world_width && sightpos_y>=0 && sightpos_y<this.s.settings.world_height){
            let t = this.s.world.get_terrain(sightpos_x, sightpos_y);

            sightval_energy_object = this.get_input_val_energy_object(t);
            sightval_slot_object = this.get_input_val_slot_object(t);

            sightval_trace_eproboteater = t.trace_eproboteater;
            sightval_trace_eprobot = t.trace_eprobot;
            sightval_tail_eproboteater = t.tail_eproboteater;
            sightval_tail_eprobot = t.tail_eprobot;
            sightval_poison = t.poison;
            sightval_info = t.info;
        }

        return {
            sightval_slot_object: sightval_slot_object,
            sightval_energy_object: sightval_energy_object,
            sightval_trace_eproboteater: sightval_trace_eproboteater,
            sightval_trace_eprobot: sightval_trace_eprobot,
            sightval_tail_eproboteater: sightval_tail_eproboteater,
            sightval_tail_eprobot: sightval_tail_eprobot,
            sightval_poison: sightval_poison,
            sightval_info: sightval_info
        }
    }

    get_input_val_slot_object(t){
        if (t.slot_object) {
            if (t.slot_object.get_id() == OBJECTTYPES.EPROBOT.id){
                return 1;
            }else if (t.slot_object.get_id() == OBJECTTYPES.EPROBOTEATER.id){
                return 2;
            }
        }else{
            return 0;
        }
    }

    get_input_val_energy_object(t){
        if (t.energy_object) {
            if (t.energy_object.get_id() == OBJECTTYPES.PLANT.id){
                return 1;
            }
        }else{
            return 0;
        }
    }

    set_input(){
        var amount = this.s.settings.DATA_LENGTH / this.s.settings.DATA_INOUT_INTERVAL;
        for (let i=0;i<amount;i++){
            var current_frame_end = (i+1)*this.s.settings.DATA_INOUT_INTERVAL;

            let sightval = this.get_sightval();

            this.working_data[current_frame_end-21] = sightval.sightval_info;
            this.working_data[current_frame_end-20] = sightval.sightval_poison;
            this.working_data[current_frame_end-19] = sightval.sightval_tail_eprobot;
            this.working_data[current_frame_end-18] = sightval.sightval_tail_eproboteater;
            this.working_data[current_frame_end-17] = sightval.sightval_trace_eprobot;
            this.working_data[current_frame_end-16] = sightval.sightval_trace_eproboteater;
            this.working_data[current_frame_end-15] = sightval.sightval_slot_object;
            this.working_data[current_frame_end-14] = sightval.sightval_energy_object;

            this.working_data[current_frame_end-13] = this.t.info;
            this.working_data[current_frame_end-12] = this.t.poison;
            this.working_data[current_frame_end-11] = this.t.tail_eprobot;
            this.working_data[current_frame_end-10] = this.t.tail_eproboteater;
            this.working_data[current_frame_end-9] = this.t.trace_eprobot;
            this.working_data[current_frame_end-8] = this.t.trace_eproboteater;
            this.working_data[current_frame_end-7] = this.get_input_val_energy_object(this.t);

            this.working_data[current_frame_end-6] = this.orientation;
            this.working_data[current_frame_end-5] = this.tick;
            this.working_data[current_frame_end-4] = this.energy;
            this.working_data[current_frame_end-3] = this.water;
            this.working_data[current_frame_end-2] = this.t.x;
            this.working_data[current_frame_end-1] = this.t.y;
        }
    }
}