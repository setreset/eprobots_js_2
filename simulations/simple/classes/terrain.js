class Terrain {

    constructor(s, x, y) {
        this.s = s;
        this.x = x;
        this.y = y;

        this.slot_object = null;
        this.energy_object = null;

        this.trace_eprobot = 0;
        this.trace_eprobot_expiry = null;

        this.tail_eprobot = [];
        this.tail_eprobot_init();

        this.trace_eproboteater = 0;
        this.trace_eproboteater_expiry = null;

        this.tail_eproboteater = 0;

        this.poison = 0;
        this.poison_expiry = null;

        this.info = 0;
        this.info_expiry = null;
    }

    tail_eprobot_init(){
        for (let i = 0;i< this.s.settings.concurrency;i++){
            this.tail_eprobot.push(0);
        }
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

        var energy_object = this.energy_object;
        if (energy_object != null){
            if (energy_object.get_id() == OBJECTTYPES.PLANT.id){
                energy_object = {
                    id: energy_object.get_id()
                }
            }
        }

        return {
            slot_object: slot_object,
            energy_object: energy_object
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

    set_trace_object_eprobot(o){
        this.trace_object_eprobot = o;
    }

    set_trace_object_eproboteater(o){
        this.trace_object_eproboteater = o;
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
                for (let i=0;i< this.s.settings.concurrency; i++){
                    if (this.tail_eprobot[i] > 0){
                        let color = parseInt(360/this.s.settings.concurrency)*i;

                        if (this.s.settings.colortheme=="dark"){
                            return "hsl("+color+", 100%, 10%)";
                        }else if (this.s.settings.colortheme=="bright"){
                            return "hsl("+color+", 100%, 70%)";
                        }
                    }
                }

                if (this.poison > 0) {
                    if (this.s.settings.colortheme=="dark") {
                        return "rgb(46, 0, 41)";
                    }else if(this.s.settings.colortheme=="bright"){
                        return "rgb(245, 0, 216)";
                    }
                }else if (this.trace_eprobot > 0){
                    let l;
                    if (this.s.settings.colortheme=="dark") {
                        l = parseInt(tools_map_range(this.trace_eprobot, 0, this.s.settings.eprobots_lifetime, 0, 7));
                        l = Math.min(l, 7);
                    }else if(this.s.settings.colortheme=="bright"){
                        l = parseInt(tools_map_range(this.trace_eprobot, 0, this.s.settings.eprobots_lifetime, 100, 85));
                        l = Math.max(l, 0);
                    }
                    return "hsl(0, 100%, "+l+"%)";
                }else if (this.trace_eproboteater > 0){
                    let l;
                    if (this.s.settings.colortheme=="dark") {
                        l = parseInt(tools_map_range(this.trace_eproboteater, 0, this.s.settings.eprobots_lifetime, 0, 7));
                        l = Math.min(l, 7);
                    }else if(this.s.settings.colortheme=="bright"){
                        l = parseInt(tools_map_range(this.trace_eproboteater, 0, this.s.settings.eprobots_lifetime, 100, 85));
                        l = Math.max(l, 85);
                    }
                    return "hsl(192, 100%, "+l+"%)";
                }else if (this.info > 0){
                    let c = parseInt(tools_map_range(this.info, 0, 9, 0, 360));
                    return "hsl("+c+", 100%, 7%)";
                }else{
                    return this.s.settings.background_color[this.s.settings.colortheme];
                }
            }
        }
    }
}