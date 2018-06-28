class Plant {

    constructor(s, x_pos, y_pos) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;

        this.s = s;
        this.energy_count = 130000; //1000;

        this.s.world.world_set_energy(this);
        this.s.world.counter_plant++;
    }

    get_id(){
        return OBJECTTYPES.PLANT;
    }

    get_color(){
        return "rgb(0, 255, 0)";
    }

    get_lifetime(){
        return this.s.settings.plants_lifetime;
    }

    kill(){
        this.s.world.world_unset(this.x_pos, this.y_pos);
        this.s.world.counter_plant--;
        this.is_dead = true;
    }

    step(){
        let new_plant = null;
        //console.log(this.s.world.counter_plant);
        if (this.s.world.counter_plant<this.s.settings.plants_max){
            let spreadval = tools_random(8);
            let vec = DIRECTIONS[spreadval];
            let spreadpos_x = this.s.correct_pos_width(this.x_pos + vec.x);
            let spreadpos_y = this.s.correct_pos_height(this.y_pos + vec.y);
            let t = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
            if (t.slot_object == null){
                new_plant = new Plant(this.s, spreadpos_x, spreadpos_y);
            }
        }


        this.tick++;
        return new_plant;
    }
}