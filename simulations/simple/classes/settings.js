class Settings {

    // raspi: 800x480 | 400x240
    // kleiner monitor: 1440x900 | 360x225
    // großer monitor: 1920x1080 | 480x270
    constructor() {
        let screensize_width = window.screen.width; // * window.devicePixelRatio;
        let screensize_height = window.screen.height; // * window.devicePixelRatio;
        console.log("devicePixelRatio: "+window.devicePixelRatio);
        console.log("resolution: "+screensize_width+"x"+screensize_height);
        let world_width = screensize_width/2;
        let world_height = screensize_height/2;
        console.log("world dimensions: "+world_width+"x"+world_height);

        this.colortheme = "dark";
        this.background_color = {
            dark: "#000000",
            bright: "#ffffff"
        };
        this.beam_at_borders = false;
        this.world_width = world_width;
        this.world_height = world_height;
        this.frame_time = 10; //1000/100;
        this.plants_max = 450;
        this.plants_lifetime = 250;
        this.eprobots_max = 500;
        this.eprobots_lifetime = 2500;
        this.eprobots_fossiltime = 5000;
        this.tracetime = 25;
        this.PROGRAM_LENGTH = 500;
        this.DATA_LENGTH = 500;
        this.DATA_INOUT_INTERVAL = 25;
        this.PROGRAM_STEPS = 1000;
        this.MUTATE_POSSIBILITY = 0.01;
        this.MUTATE_STRENGTH = 400;
        this.nest_x = parseInt(this.world_width/2);
        this.nest_y = parseInt(this.world_height/2);

        this.feature_traces = true;
        this.feature_poison = true;
        this.feature_info = false;
    }

    loadState(settingsstate){
        for (let key in settingsstate){
            this[key] = settingsstate[key];
        }
    }

    toJSON(){
        var settings_o = {};

        for (let key in this){
            settings_o[key] = this[key];
        }

        return settings_o;
    }
}