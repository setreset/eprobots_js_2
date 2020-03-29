class EprobotPlantEater extends EprobotBase{
    try_eat(t_new){
        let energy_object = t_new.get_slot_object();
        if (energy_object && energy_object.get_id()==OBJECTTYPES.PLANT.id){

            this.energy+=this.config.energy_profit;
            energy_object.kill();
            this.s.world.world_unset(t_new.x, t_new.y, energy_object);
        }
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
            //this.energy--;
        }
    }

    fork_ready(){
        return this.tick > 100;
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

            //this.energy = this.energy - energy_for_child;

            let eprobot_class = eprobot_classes[this.config.eprobot_class];
            new_eprobot = new eprobot_class(this.s, new_program, new_data, this.config.energy_start, this.config);
            this.s.world.world_set(new_eprobot, spreadpos_x, spreadpos_y);
        }
        return new_eprobot
    }
}

eprobot_classes["eprobot_planteater"] = EprobotPlantEater;