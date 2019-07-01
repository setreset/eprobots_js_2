class Settings {

    // raspi: 800x480 | 400x240
    // kleiner monitor: 1440x900 | 360x225
    // großer monitor: 1920x1080 | 480x270
    constructor(s) {
        this.s = s;

        this.world_divider = 2;
        this.colortheme = "dark";
        this.background_color = {
            dark: "#000000",
            bright: "#ffffff"
        };
        this.beam_at_borders = false;
        this.frame_time = 10; //1000/100;
        this.plants_max = 450;
        this.plants_lifetime = 250;
        this.concurrency = 4;
        this.concurrency_eproboteater = 0;
        this.eprobots_max = 1000;
        this.eproboteaters_max = 250;
        this.eprobots_lifetime_max = 5000;
        this.eprobots_fossiltime = 5000;
        this.tracetime = 25;
        this.PROGRAM_LENGTH = 500;
        this.DATA_LENGTH = 500;
        this.DATA_INOUT_INTERVAL = 25;
        this.PROGRAM_STEPS = 1000;
        this.MUTATE_POSSIBILITY = 0.01;
        this.MUTATE_STRENGTH = 400;
        this.energy_start = 800;
        this.energy_cost_fork = 800;
        this.energy_profit_plant = 850;
        this.energy_level_fork = 1200;

        this.feature_traces = false;
        this.feature_poison = false;
        this.feature_info = false;
        this.feature_shared_food_storage = false;
    }

    //loadState(settingsstate){
    //    for (let key in settingsstate){
    //        this[key] = settingsstate[key];
    //    }
    //}

    //toJSON(){
    //    var settings_o = {};
    //
    //    for (let key in this){
    //        settings_o[key] = this[key];
    //    }
    //
    //    return settings_o;
    //}
}