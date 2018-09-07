class World_simple {

    constructor(s, width, height) {
        this.s = s;

        // init
        this.worldarr = new Array(width);
        for (var x=0;x<this.worldarr.length;x++){
            this.worldarr[x] = new Array(height);
            for (var y=0;y<height;y++){
                this.worldarr[x][y] = new Terrain_simple(s, x, y);
            }
        }

        this.counter_eprobot = 0;

        this.paintlist = [];
        this.paintobj = {};
    }

    get_terrain(x, y){
        return this.worldarr[x][y];
    }

    refresh_paintobj(t, x_pos, y_pos){
        let coord = x_pos.toString() + ":" + y_pos.toString();
        this.paintobj[coord] = {color: t.get_color(), x_pos: x_pos, y_pos: y_pos};
        //this.paintlist.push({color: o.get_color(), x_pos: o.x_pos, y_pos: o.y_pos});
    }

    world_move(o, old_pos_x, old_pos_y, new_pos_x, new_pos_y){
        var t = this.get_terrain(new_pos_x, new_pos_y);
        t.set_slot_object(o);
        o.t = t;

        this.refresh_paintobj(t, new_pos_x, new_pos_y);

        var t = this.get_terrain(old_pos_x, old_pos_y);
        t.set_slot_object(null);

        this.refresh_paintobj(t, old_pos_x, old_pos_y);
    }

    world_set(o, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.set_slot_object(o);
        o.t = t;

        if (o.get_id()==OBJECTTYPES_simple.EPROBOT.id){
            this.counter_eprobot++;
        }

        this.refresh_paintobj(t, x_pos, y_pos);
    }

    world_unset(x,y, object_class){
        var t = this.get_terrain(x, y);
        t.set_slot_object(null);

        if (object_class==OBJECTTYPES_simple.EPROBOT.id){
            this.counter_eprobot--;
        }

        this.refresh_paintobj(t, x, y);
    }

    world_set_energy(o, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.set_energy_object(o);
        o.t = t;

        this.refresh_paintobj(t, x_pos, y_pos);
    }

    world_unset_energy(x,y){
        var t = this.get_terrain(x, y);
        t.set_energy_object(null);

        this.refresh_paintobj(t, x, y);
    }

}