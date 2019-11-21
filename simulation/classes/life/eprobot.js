eprobot_classes = {};

class Eprobot extends EprobotBase{
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

        let energydrop_raw = this.get_output_val(2);
        let energyval = this.map_output_val(energydrop_raw, 2);

        //let poison_raw = this.get_output_val(1);
        //let poisonval = this.map_output_val(poison_raw, 2);
        //
        //let info_raw = this.get_output_val(2);
        //let infoval = this.map_output_val(info_raw, 11);
        //
        //let sfs_raw = this.get_output_val(3);
        //let sfsval = this.map_output_val(sfs_raw, 3);

        //return [moveval, poisonval, infoval, sfsval];
        return [moveval, forkval, energyval];
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
        let dropval = output[2];

        if (dropval==1){
            let t = this.s.world.get_terrain(this.position.x, this.position.y);

            if (t["special_energy_"+this.config.eprobot_key]==0){
                t["special_energy_"+this.config.eprobot_key]++;
                this.energy -= 20;
            }
        }
    }
}

eprobot_classes["eprobot"] = Eprobot;

class EprobotParasit extends EprobotBase{
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

eprobot_classes["eprobot_parasit"] = EprobotParasit;

//class EprobotA extends Eprobot{
//    constructor(s, program, init_data, energy, config) {
//        super(s, program, init_data, energy, config);
//        this.special_energy_consume = "eprobot_c";
//        this.special_energy_no_go_fields = ["eprobot_a", "eprobot_b"];
//    }
//}
//
//class EprobotB extends Eprobot{
//    constructor(s, program, init_data, energy, config) {
//        super(s, program, init_data, energy, config);
//        this.special_energy_consume = "eprobot_a";
//        this.special_energy_no_go_fields = ["eprobot_b", "eprobot_c"];
//    }
//}
//
//class EprobotC extends Eprobot{
//    constructor(s, program, init_data, energy, config) {
//        super(s, program, init_data, energy, config);
//        this.special_energy_consume = "eprobot_b";
//        this.special_energy_no_go_fields = ["eprobot_c", "eprobot_a"];
//    }
//}

class EprobotEater extends EprobotBase{
    constructor(s, program, init_data, energy, config) {
        super(s, program, init_data, energy, config);
        this.special_energy_no_go_fields = ["eprobot_a", "eprobot_b"];
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
        if (t_new.get_slot_object() && t_new.get_slot_object().get_id()==OBJECTTYPES.EPROBOT.id /*&& t_new.get_slot_object().config.eprobot_key!=this.config.eprobot_key*/){

            this.energy+=(this.s.settings.energy_profit_plant*64);
            t_new.get_slot_object().kill();
            this.s.world.world_unset(t_new.x, t_new.y, t_new.get_slot_object());
        }
    }

    action_hook(output){
    }
}

eprobot_classes["eprobot_eater"] = EprobotEater;