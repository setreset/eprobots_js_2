class Settings {

    // raspi: 800x480 | 400x240
    // kleiner monitor: 1440x900 | 360x225
    // großer monitor: 1920x1080 | 480x270
    constructor() {
        this.background_color = "#000000";
        this.beam_at_borders = false;
        this.world_width = 400;
        this.world_height = 240;
        this.sleeptime = 25;
        this.plants_max = 500;
        this.plants_lifetime = 250;
        this.eprobots_max = 300;
        this.eprobots_lifetime = 400;
        this.eprobots_fossiltime = 400;
        this.PROGRAM_LENGTH = 500;
        this.DATA_LENGTH = 20;
        this.PROGRAM_STEPS = 1000;
        this.MUTATE_POSSIBILITY = 0.01;
        this.MUTATE_STRENGTH = 400;
        this.nest_x = 50;
        this.nest_y = 50;
    }

    loadState(settingsstate){
        Object.entries(settingsstate).forEach(function(o) {
            this[o[0]] = o[1];
        }, this);
    }

    toJSON(){
        var settings_o = {};
        Object.entries(this).forEach(function(o) {
            settings_o[o[0]] = o[1];
        }, this);
        return settings_o;
    }
}