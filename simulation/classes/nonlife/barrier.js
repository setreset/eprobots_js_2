class Barrier {

    constructor(s) {
        this.position = {x: null, y:null};

        this.s = s;
    }

    //toJSON(){
    //    return {
    //        id: this.get_id(),
    //        x_pos: this.t.x,
    //        y_pos: this.t.y,
    //    };
    //}

    get_id(){
        return OBJECTTYPES.BARRIER.id;
    }

    get_color(){
        return OBJECTTYPES.BARRIER.color[this.s.settings.colortheme];
    }

    set_odor_fields(){
        let t = this.s.world.get_terrain(this.position.x, this.position.y);
        t.odor_barrier+=2;
        for (let v of DIRECTIONS) {
            let new_pos_x = this.position.x + v.x;
            let new_pos_y = this.position.y + v.y;

            // get terrain
            if (new_pos_x>=0 && new_pos_x<this.s.world_width && new_pos_y>=0 && new_pos_y<this.s.world_height){
                let t = this.s.world.get_terrain(new_pos_x, new_pos_y);
                t.odor_barrier++;
            }
        }
    }

    unset_odor_fields(){
        let t = this.s.world.get_terrain(this.position.x, this.position.y);
        t.odor_barrier-=2;
        for (let v of DIRECTIONS) {
            let new_pos_x = this.position.x + v.x;
            let new_pos_y = this.position.y + v.y;

            // get terrain
            if (new_pos_x>=0 && new_pos_x<this.s.world_width && new_pos_y>=0 && new_pos_y<this.s.world_height){
                let t = this.s.world.get_terrain(new_pos_x, new_pos_y);
                t.odor_barrier--;
            }
        }
    }
}