class EprobotEater extends EprobotBase{

    try_eat(t_new){
        let slot_object = t_new.get_slot_object();
        /*&& t_new.get_slot_object().config.eprobot_key!=this.config.eprobot_key*/
        if (slot_object && slot_object.get_id()==OBJECTTYPES.EPROBOT.id && (slot_object.config.eprobot_key=="eprobot_ateeater" || slot_object.config.eprobot_key=="eprobot_planteater")){

            // eater kann ateeater oder planteater nicht fressen, wenn sich zwei oder mehr von der sorte in der nähe ist
            let can_eat = true;
            //if (slot_object.config.eprobot_key=="eprobot_ateeater" && t_new.odor_eprobot_ateeater>1){
            //    can_eat = false;
            //}
            //if (slot_object.config.eprobot_key=="eprobot_planteater" && t_new.odor_eprobot_planteater>1){
            //    can_eat = false;
            //}

            if (can_eat){
                this.energy+=this.config.energy_profit;
                slot_object.kill();
                this.s.world.world_unset(t_new.x, t_new.y, slot_object);
            }
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
            this.energy--;
        }
    }

    action_hook(output){
    }
}

eprobot_classes["eprobot_eater"] = EprobotEater;