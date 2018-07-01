class Terrain {

    constructor(s) {
        this.s = s;

        this.slot_object = null;
        this.energy_object = null;
    }

    toJSON(){
        var slot_object = this.slot_object;
        if (slot_object != null){
            if (slot_object.get_id() == OBJECTTYPES.EPROBOT){
                slot_object = {
                    id: slot_object.get_id()
                }
            }
        }
        return {
            slot_object: slot_object,
            energy_object: this.energy_object
        };
    }

    set_slot_object(o){
        this.slot_object = o;
    }

    get_slot_object(){
        return this.slot_object;
    }

    set_energy_object(o){
        this.energy_object = o;
    }

    get_energy_object(){
        return this.energy_object;
    }

    get_color(){
        if (this.slot_object){
            return this.slot_object.get_color();
        }else{
            if (this.energy_object){
                return this.energy_object.get_color();
            }else{
                return this.s.settings.background_color;
            }
        }
    }
}