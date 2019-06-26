class EprobotEater extends EprobotBase{

    get_individuum_max() {
        return parseInt(this.s.settings.eproboteaters_max / this.s.settings.concurrency_eproboteater);
    }

    get_id(){
        return OBJECTTYPES.EPROBOTEATER.id;
    }

    get_color(){
        let color = this.s.get_base_color_eproboteater(this.kind);
        return "hsl("+color+", 100%, 48%)";
        //return OBJECTTYPES.EPROBOTEATER.color[this.s.settings.colortheme];
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
        let old_t = this.s.world.get_terrain(this.position.x, this.position.y);

        let old_pos_x = this.position.x;
        let old_pos_y = this.position.y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        if (this.s.settings.feature_traces){
            old_t.trace_eproboteater = Math.min(old_t.trace_eproboteater+200,5000);
            old_t.trace_eproboteater_expiry = this.s.steps + 1000;
        }

        old_t.tail_eproboteater[this.kind] += 1;
        this.tail.push({"t": old_t, "rt": this.tick+20});

        this.s.drawer.refresh_paintobj(old_t.x, old_t.y, old_t.get_color());
    }

    step(){
        //let moveval = this.get_move();
        let output = this.get_output_OISC();
        let moveval = output[0];
        let infoval = output[1];

        // move
        if (moveval<DIRECTIONS.length){
            let vec = DIRECTIONS[moveval];
            let movepos_x = this.position.x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
            let movepos_y = this.position.y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);

            let t = this.s.world.get_terrain(movepos_x, movepos_y);
            let slot_object = t.get_slot_object();
            if (slot_object == null || slot_object.get_id()==OBJECTTYPES.EPROBOT.id){
                if (slot_object){
                    //slot_object.kill();
                    this.s.stats_incr("eprobot_kills");
                    this.energy+=slot_object.energy+1;
                    this.life_counter+=10;
                    slot_object.kill();
                    this.s.world.world_unset(movepos_x, movepos_y, slot_object);
                }

                this.move(movepos_x, movepos_y);
            }

            if (t.poison > 0){
                t.poison--;
                this.life_counter -= 40;
                //this.kill();
                //this.s.world.world_unset(this.t.x, this.t.y, this.get_id());
            }
        }

        if (this.s.settings.feature_info && infoval < 10){
            let t = this.s.world.get_terrain(this.position.x, this.position.y);
            t.info = infoval;
            t.info_expiry = this.s.steps + 1000;
        }

        if (this.tail.length>0){
            if (this.tail[0].rt<=this.tick){
                let to = this.tail.shift();
                let t = to.t;
                t.tail_eproboteater[this.kind] = Math.max(t.tail_eproboteater[this.kind]-1, 0);
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
        let spreadpos_x = this.position.x + vec.x; //this.s.correct_pos_width(this.position.x + vec.x);
        let spreadpos_y = this.position.y + vec.y; //this.s.correct_pos_height(this.position.y + vec.y);
        //let spreadpos_x = this.s.settings.nest_x+tools_random2(-20,20);
        //let spreadpos_y = this.s.settings.nest_y+tools_random2(-20,20);
        let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (spreadterrain.slot_object == null){
            var new_program = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program);
            var new_data = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data);
            new_eprobot = new EprobotEater(this.s, new_program, new_data, this.kind);
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
            t.tail_eproboteater[this.kind] = Math.max(t.tail_eproboteater[this.kind]-1, 0);
            this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
        }
    }
}