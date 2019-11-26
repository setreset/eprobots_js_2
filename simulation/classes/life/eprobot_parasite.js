class EprobotParasite extends EprobotBase{
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

        //let poison_raw = this.get_output_val(1);
        //let poisonval = this.map_output_val(poison_raw, 2);
        //
        //let info_raw = this.get_output_val(2);
        //let infoval = this.map_output_val(info_raw, 11);
        //
        //let sfs_raw = this.get_output_val(3);
        //let sfsval = this.map_output_val(sfs_raw, 3);

        //return [moveval, poisonval, infoval, sfsval];
        return [moveval, forkval];
    }

    try_eat(t_new){
        let energy_object = t_new.get_energy_object();
        if (energy_object){
            if (energy_object.get_id()==OBJECTTYPES.PLANT.id){
                //slot_object.kill();
                this.energy+=this.s.settings.energy_profit_plant;
                energy_object.energy_count--;
                if (energy_object.energy_count==0){
                    energy_object.is_dead=true;
                    this.s.world.world_unset_energy(t_new.x, t_new.y, energy_object);
                    //console.log(new Date()+": entferne pflanze");
                }
            }
        }

        for (let special_energy_consume_field of this.config.special_energy_consume_fields){
            if (t_new["special_energy_"+special_energy_consume_field]>0){
                this.energy+=this.s.settings.energy_profit_plant;
                t_new["special_energy_"+special_energy_consume_field] = tools_negative_to_0(t_new["special_energy_"+special_energy_consume_field]-1);
            }
        }
    }

    action_hook(output){
    }
}

eprobot_classes["eprobot_parasite"] = EprobotParasite;