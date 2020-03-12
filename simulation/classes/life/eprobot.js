class Eprobot extends EprobotBase{
    try_eat(t_new){
        let energy_object = t_new.get_slot_object();
        if (energy_object && energy_object.get_id()==OBJECTTYPES.PLANT.id && energy_object.config.subtype==this.config.subtype){

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
			this.energy--;
        }
    }
	
	action_hook(output){
		let claimval = output[1];
		if (claimval==1){
			this.energy-=500;
			let t = this.s.world.get_terrain(this.position_x, this.position_y);
			if (t.claim == -1 || t.claim == 1){
				t.claim = this.config.subtype;
			}
		}
    }
}

eprobot_classes["eprobot"] = Eprobot;