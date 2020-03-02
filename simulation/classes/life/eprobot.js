class Eprobot extends EprobotBase{
    try_eat(t_new){
        let energy_object = t_new.get_slot_object();
        if (energy_object && energy_object.get_id()==OBJECTTYPES.PLANT.id){

            this.energy+=this.s.settings.energy_profit_plant;
            energy_object.kill();
            this.s.world.world_unset(t_new.x, t_new.y, energy_object);
        }
    }
}

eprobot_classes["eprobot"] = Eprobot;