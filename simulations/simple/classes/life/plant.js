class Plant {

    constructor(s) {
        this.t = null;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.energy_count = 150; //1000;
    }

    toJSON(){
        return {
            id: this.get_id(),
            x_pos: this.t.x,
            y_pos: this.t.y,
            energy_count: this.energy_count
        };
    }

    get_id(){
        return OBJECTTYPES.PLANT.id;
    }

    get_color(){
        return OBJECTTYPES.PLANT.color;
    }

    //get_lifetime(){
    //    return this.s.settings.plants_lifetime;
    //}

    //kill(){
    //    this.s.world.world_unset(this.x_pos, this.y_pos);
    //    this.s.world.counter_plant--;
    //    this.is_dead = true;
    //}
    //

    step(){
        this.tick++;
    }

    fork(){
        console.log("plant fork");
        let new_plant = null;
        //let spreadval = tools_random(8);
        //let vec = DIRECTIONS[spreadval];
        let spread_max = 5;
        if (Math.random()>0.990){
            spread_max = 300;
        }

        let spreadoffset_x = tools_random2(-spread_max,spread_max);
        let spreadoffset_y = tools_random2(-spread_max,spread_max);
        let spreadpos_x = this.s.correct_pos_width(this.t.x + spreadoffset_x);
        let spreadpos_y = this.s.correct_pos_height(this.t.y + spreadoffset_y);
        let t = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (t.energy_object == null){
            new_plant = new Plant(this.s);
            this.s.world.world_set_energy(new_plant, spreadpos_x, spreadpos_y);
        }
        return new_plant;
    }
}