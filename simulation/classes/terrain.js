class Terrain {

    constructor(s, x, y) {
        this.s = s;
        this.x = x;
        this.y = y;

        this.dirty = false;

        this.slot_object = null;
        this.energy_object = null;

        this.special_energy_fields = [];
        this.special_energy_init();

        this.odor_plant = 0;
        this.odor_barrier = 0;
        this.odor_eprobot = 0;

        this.trace_eprobot = 0;
        this.trace_eprobot_expiry = null;

        this.tail_eprobot_init();

        this.poison = 0;
        this.poison_expiry = null;

        this.info = 0;
        this.info_expiry = null;
    }

    tail_eprobot_init(){
        for (let eprobot_config of this.s.simconfig){
            if ("tails" in eprobot_config && eprobot_config["tails"] == true) {
                this["tail_" + eprobot_config.eprobot_key] = 0;
            }
        }
    }

    special_energy_init(){
        for (let eprobot_config of this.s.simconfig){
            if ("special_energy" in eprobot_config){
                let special_energy_key = "special_energy_"+eprobot_config.eprobot_key;
                this[special_energy_key] = 0;
                let tmp = tools_modulo_with_wrap(eprobot_config.base_color-50, 360);
                let special_energy_color = "hsl("+tmp+", 100%, 48%)";
                this.special_energy_fields.push({"key": special_energy_key, color: special_energy_color});
            }
        }
    }

    set_slot_object(o){
        this.slot_object = o;
    }

    get_slot_object(){
        return this.slot_object;
    }

    set_trace_object_eprobot(o){
        this.trace_object_eprobot = o;
    }

    prepare_paint(){
        if (this.dirty == false){
            this.dirty = true;
            this.s.drawer.paintlist.push(this);
        }
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
                for (let special_energy_field of this.special_energy_fields){
                    if (this[special_energy_field.key] > 0){
                        let colorstring = special_energy_field.color;
                        return colorstring;
                    }
                }

                for (let eprobot_config of this.s.simconfig){
                    if (this["tail_"+eprobot_config.eprobot_key] > 0){
                        let color = eprobot_config.base_color;

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
                }

                if (this.trace_eprobot > 0){
                    let l;
                    if (this.s.settings.colortheme=="dark") {
                        l = parseInt(tools_map_range(this.trace_eprobot, 0, this.s.settings.eprobots_lifetime_max, 0, 7));
                        l = Math.min(l, 7);
                    }else if(this.s.settings.colortheme=="bright"){
                        l = parseInt(tools_map_range(this.trace_eprobot, 0, this.s.settings.eprobots_lifetime_max, 100, 85));
                        l = Math.max(l, 0);
                    }
                    return "hsl(0, 100%, "+l+"%)";
                }

                if (this.info > 0){
                    let c = parseInt(tools_map_range(this.info, 0, 9, 0, 360));
                    return "hsl("+c+", 100%, 7%)";
                }else{
                    return this.s.settings.background_color[this.s.settings.colortheme];
                }
            }
        }
    }
}