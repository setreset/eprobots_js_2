class EprobotEater extends EprobotBase{

    get_individuum_max() {
        return this.s.settings.eprobots_max - parseInt(this.s.settings.eprobots_max/10);
    }

    get_id(){
        return OBJECTTYPES.EPROBOTEATER.id;
    }

    get_color(){
        return OBJECTTYPES.EPROBOTEATER.color[this.s.settings.colortheme];
    }

    get_output_OISC(){
        let steps = tools_compute(this.program, this.working_data, this.s.settings.PROGRAM_STEPS);

        if (steps>=this.s.settings.PROGRAM_STEPS){
            this.s.stats_incr("high_stepcounter");
        }

        /*this.s.stats_add("mean_sum", steps);
         this.s.stats_incr("mean_amount");
         if (Math.random()>0.9999){
         console.log("Steps: "+steps);
         console.log("Steps mean: "+this.s.stats["mean_sum"]/this.s.stats["mean_amount"]);
         }*/

        let penalty = parseInt(steps/10);
        this.life_counter = this.life_counter - penalty;

        let moveval_raw = this.get_output_val(0);
        let moveval = this.map_output_val(moveval_raw, DIRECTIONS.length + 1);

        let info_raw = this.get_output_val(1);
        let infoval = this.map_output_val(info_raw, 11);

        return [moveval, infoval];
    }

    move(new_pos_x, new_pos_y){
        let old_t = this.t;
        let old_pos_x = this.t.x;
        let old_pos_y = this.t.y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        if (this.s.settings.feature_traces){
            old_t.trace_eproboteater = Math.min(old_t.trace_eproboteater+200,5000);
            old_t.trace_eproboteater_expiry = this.s.steps + 1000;
            this.afterstep_trace = old_t;
        }

        old_t.tail_eproboteater += 1;
        this.tail.push({"t": old_t, "rt": this.tick+20});

        this.s.drawer.refresh_paintobj(old_t.x, old_t.y, old_t.get_color());
    }

    step(){
        //let moveval = this.get_move();
        this.afterstep_trace = null;
        let output = this.get_output_OISC();
        let moveval = output[0];
        let infoval = output[1];

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
                    this.life_counter+=10;
                    slot_object.kill();
                    this.s.world.world_unset(movepos_x, movepos_y, slot_object.get_id());
                }

                this.move(movepos_x, movepos_y);
            }

            if (this.t.poison > 0){
                this.t.poison--;
                this.life_counter -= 20;
                //this.kill();
                //this.s.world.world_unset(this.t.x, this.t.y, this.get_id());
            }
        }

        if (this.s.settings.feature_info && infoval < 10){
            this.t.info = infoval;
            this.t.info_expiry = this.s.steps + 1000;
        }

        if (this.tail.length>0){
            if (this.tail[0].rt<=this.tick){
                let to = this.tail.shift();
                let t = to.t;
                t.tail_eproboteater = Math.max(t.tail_eproboteater-1, 0);
                this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
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
            var new_program = tools_mutate(this.m_pos, this.s.settings.MUTATE_STRENGTH, this.program);
            var new_data = tools_mutate(this.m_pos, this.s.settings.MUTATE_STRENGTH, this.init_data);
            var m_pos_offset = (Math.random()-0.5)/100;
            var new_m_pos = this.m_pos; //Math.max(this.m_pos + m_pos_offset, 0);
            var m_strength_offset = tools_random2(-10,10);
            var new_m_strength = this.m_strength; //Math.max(this.m_strength + m_strength_offset, 0);
            new_eprobot = new EprobotEater(this.s, new_program, new_data, new_m_pos, new_m_strength);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
            this.energy = this.energy - this.get_fork_energy();
            if (this.water>0){
                this.water--;
            }
        }
        return new_eprobot
    }

    kill(){
        this.is_dead=true;
        for (let to of this.tail) {
            let t = to.t;
            t.tail_eproboteater = Math.max(t.tail_eproboteater-1, 0);
            this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
        }
    }
}