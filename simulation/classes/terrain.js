class Terrain {

    constructor(s, x, y) {
        this.s = s;
        this.x = x;
        this.y = y;

        this.dirty = false;

        this.slot_object = null;
        this.energy_object = null;

        this.odor_barrier = 0;
        this.odor_init();

        this.trace_eprobot = 0;
        this.trace_eprobot_expiry = null;

        this.tail_eprobot_init();
        this.deadtrace_eprobot_init();

        this.energy = 0;
        this.water = 0;

        this.poison = 0;
        this.poison_expiry = null;

        this.info = 0;
        this.info_expiry = null;
    }

    deadtrace_eprobot_init(){
        for (let eprobot_config of this.s.simconfig){
            this["deadtrace_" + eprobot_config.eprobot_key] = 0;
        }
    }

    tail_eprobot_init(){
        for (let eprobot_config of this.s.simconfig){
            if ("tails" in eprobot_config && eprobot_config["tails"] == true) {
                this["tail_" + eprobot_config.eprobot_key] = 0;
            }
        }
    }

    odor_init(){
        for (let eprobot_config of this.s.simconfig){
            this["odor_" + eprobot_config.eprobot_key] = 0;
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
                }

                let deadtrace_colors = [];

                //let deadtrace_val;
                //deadtrace_val = this["deadtrace_eprobot_a"];
                //if (deadtrace_val > 0){
                //    let color = 0;
                //    let conv_val = Math.floor(tools_map_range(deadtrace_val, 0, 50, 0, 10));
                //    // Wert soll nicht größer als 10 sein
                //    conv_val = Math.min(conv_val, 10);
                //    deadtrace_colors.push(chroma("hsl("+color+", 100%, "+conv_val+"%)"));
                //}
                //
                //deadtrace_val = this["deadtrace_eprobot_plant"];
                //if (deadtrace_val > 0){
                //    let color = 120;
                //    let conv_val = Math.floor(tools_map_range(deadtrace_val, 0, 50, 0, 10));
                //    // Wert soll nicht größer als 10 sein
                //    conv_val = Math.min(conv_val, 10);
                //    deadtrace_colors.push(chroma("hsl("+color+", 100%, "+conv_val+"%)"));
                //}

                for (let eprobot_config of this.s.simconfig){
                    let deadtrace_val = this["deadtrace_"+eprobot_config.eprobot_key];
                    if (deadtrace_val > 0){
                        let color = (eprobot_config.base_color + parseInt(this.s.steps/100))%360;
                        let conv_val = Math.floor(tools_map_range(deadtrace_val, 0, 50, 0, 10));
                        // Wert soll nicht größer als 10 sein
                        conv_val = Math.min(conv_val, 10);
                        return "hsl("+color+", 100%, 30%)"
						//deadtrace_colors.push(chroma("hsl("+color+", 100%, "+conv_val+"%)"));
                    }
                }

                if (this.energy){
                    return "#00f535";
                }

                if (this.water){
                    return "#0021f5";
                }

                //if (deadtrace_colors.length>0){
                //    return chroma.average(deadtrace_colors).hex();
                //}

                return this.s.settings.background_color[this.s.settings.colortheme];
            }
        }
    }
}