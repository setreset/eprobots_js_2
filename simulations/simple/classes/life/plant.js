class Plant {

    constructor(s) {
        this.position = null;

        this.s = s;
        this.is_dead = false;
        this.energy_count = 50; //300, 1000;
    }

    //toJSON(){
    //    return {
    //        id: this.get_id(),
    //        x_pos: this.t.x,
    //        y_pos: this.t.y,
    //        is_dead: this.is_dead,
    //        energy_count: this.energy_count
    //    };
    //}

    get_id(){
        return OBJECTTYPES.PLANT.id;
    }

    get_color(){
        return OBJECTTYPES.PLANT.color[this.s.settings.colortheme];
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

    set_odor_fields(){
        let t = this.s.world.get_terrain(this.position.x, this.position.y);
        t.odor_plant+=2;
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position.x + v.x, this.position.y + v.y);
            t.odor_plant++;
        }
    }

    unset_odor_fields(){
        let t = this.s.world.get_terrain(this.position.x, this.position.y);
        t.odor_plant-=2;
        for (let v of DIRECTIONS) {
            // get terrain
            let t = this.s.world.get_terrain(this.position.x + v.x, this.position.y + v.y);
            t.odor_plant--;
        }
    }

    fork(){
        //console.log("plant fork");
        let new_plant = null;
        //let spreadval = tools_random(8);
        //let vec = DIRECTIONS[spreadval];

        let spreadpos_x, spreadpos_y;

        if (Math.random()<1/50){
            spreadpos_x = tools_random(this.s.world_width);
            spreadpos_y = tools_random(this.s.world_height);
        }else{
            let spread_max = 5;
            let spreadoffset_x = tools_random2(-spread_max,spread_max);
            let spreadoffset_y = tools_random2(-spread_max,spread_max);
            spreadpos_x = this.position.x + spreadoffset_x; //this.s.correct_pos_width(this.position.x + spreadoffset_x);
            spreadpos_y = this.position.y + spreadoffset_y; //this.s.correct_pos_height(this.position.y + spreadoffset_y);
        }

        spreadpos_x = Math.max(spreadpos_x, 50);
        spreadpos_x = Math.min(spreadpos_x, this.s.world_width-50);
        spreadpos_y = Math.max(spreadpos_y, 50);
        spreadpos_y = Math.min(spreadpos_y, this.s.world_height-50);

        let t = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
        if (t.energy_object == null && t.slot_object == null){
            new_plant = new Plant(this.s);
            this.s.world.world_set_energy(new_plant, spreadpos_x, spreadpos_y);
        }
        return new_plant;
    }
}