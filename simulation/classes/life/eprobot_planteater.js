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
            if (t_new.deadtrace_eprobot_plant == 0){
                this.move(t_new.x, t_new.y);
                this.energy--;
            }
        }
    }
}

eprobot_classes["eprobot_planteater"] = EprobotPlantEater;