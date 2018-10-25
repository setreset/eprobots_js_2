class Terrain {

    constructor(s, x, y) {
        this.s = s;
        this.x = x;
        this.y = y;

        this.slot_object = null;
        this.energy_object = null;
        this.trace_object = null;
    }

    toJSON(){
        var slot_object = this.slot_object;
        if (slot_object != null){
            if (slot_object.get_id() == OBJECTTYPES.EPROBOT.id){
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

    set_trace_object(o){
        this.trace_object = o;
    }

    get_trace_object(){
        return this.trace_object;
    }

    get_color(){
        if (this.slot_object){
            return this.slot_object.get_color();
            /*if (this.slot_object.get_id()==OBJECTTYPES.EPROBOT.id){
                var color = "hsl("+this.slot_object.get_color()+", 100%, 48%)";
                return color;
            }else{
                return this.slot_object.get_color();
            }*/
        }else{
            if (this.energy_object){
                return this.energy_object.get_color();
            }else{
                if (this.trace_object){
                    var color = "hsl("+"0"+", 100%, "+(10-this.trace_object.get_color())+"%)";
                    return color;
                }else{
                    return this.s.settings.background_color;
                }
            }
        }
    }
}