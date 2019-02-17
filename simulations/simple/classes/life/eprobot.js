class Eprobot extends EprobotBase{

    get_individuum_max() {
        return this.s.settings.eprobots_max;
    }

    get_id(){
        return OBJECTTYPES.EPROBOT.id;
    }

    get_color(){
        return OBJECTTYPES.EPROBOT.color;
    }

    move(new_pos_x, new_pos_y){
        let old_t = this.t;
        let old_pos_x = this.t.x;
        let old_pos_y = this.t.y;

        this.s.world.world_move(this, old_pos_x, old_pos_y, new_pos_x, new_pos_y);

        if (this.s.settings.traces){
            old_t.trace_eprobot = Math.min(old_t.trace_eprobot+200,2500);
            this.afterstep_trace = old_t;
        }

        old_t.tail_eprobot += 1;
        this.tail.push({"t": old_t, "rt": this.tick+20});

        this.s.drawer.refresh_paintobj(old_t.x, old_t.y, old_t.get_color());
    }

    step(){
        //let moveval = this.get_move();
        this.afterstep_trace = null;
        let output = this.get_output_OISC();
        let moveval = output[0];

        // move
        if (moveval<DIRECTIONS.length){
            let vec = DIRECTIONS[moveval];
            let movepos_x = this.s.correct_pos_width(this.t.x + vec.x);
            let movepos_y = this.s.correct_pos_height(this.t.y + vec.y);

            let t = this.s.world.get_terrain(movepos_x, movepos_y);
            let slot_object = t.get_slot_object();
            if (slot_object == null){
                let energy_object = t.get_energy_object();
                if (energy_object){
                    if (energy_object.get_id()==OBJECTTYPES.PLANT.id){
                        //slot_object.kill();
                        this.energy++;
                        energy_object.energy_count--;
                        if (energy_object.energy_count==0){
                            energy_object.is_dead=true;
                            this.s.world.world_unset_energy(movepos_x, movepos_y, OBJECTTYPES.PLANT.id);
                            //console.log(new Date()+": entferne pflanze");
                        }
                    }else if (energy_object.get_id()==OBJECTTYPES.WATER.id){
                        this.water++;
                        //energy_object.energy_count--;
                        if (energy_object.energy_count==0){
                            this.s.world.world_unset_energy(movepos_x, movepos_y);
                            console.log(new Date()+": entferne wasser");
                        }
                    }

                }

                this.move(movepos_x, movepos_y);
            }
        }

        if (this.tail.length>0){
            if (this.tail[0].rt<=this.tick){
                let to = this.tail.shift();
                let t = to.t;
                t.tail_eprobot = Math.max(t.tail_eprobot-1, 0);
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
            var new_program = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program);
            var new_data = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data);
            new_eprobot = new Eprobot(this.s, new_program, new_data);
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
            t.tail_eprobot = Math.max(t.tail_eprobot-1, 0);
            this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
        }
    }
}