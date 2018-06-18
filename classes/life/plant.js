class Plant {

    constructor(s, x_pos, y_pos) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;

        this.s = s;
        this.lifetime = 0;

        this.s.world.world_set(this);
        this.s.world.counter_plant++;
    }

    get_id(){
        return OBJECTTYPES.PLANT;
    }

    get_color(){
        return "rgb(0, 255, 0)";
    }

    step(){
        let new_plant = null;
        //console.log(this.s.world.counter_plant);
        if (this.s.world.counter_plant<150){
            let spreadval = tools_random(8);
            let vec = DIRECTIONS[spreadval];
            let spreadpos_x = this.s.correct_pos_width(this.x_pos + vec.x);
            let spreadpos_y = this.s.correct_pos_height(this.y_pos + vec.y);
            let t = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
            if (t.slot_object == null){
                new_plant = new Plant(this.s, spreadpos_x, spreadpos_y);
            }
        }


        this.lifetime++;
        return new_plant;
    }
}