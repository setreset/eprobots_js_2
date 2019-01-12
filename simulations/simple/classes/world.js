class World {

    constructor(s, width, height) {
        this.s = s;

        // init
        this.worldarr = new Array(width);
        for (var x=0;x<this.worldarr.length;x++){
            this.worldarr[x] = new Array(height);
            for (var y=0;y<height;y++){
                this.worldarr[x][y] = new Terrain(s, x, y);
            }
        }

        this.counter_eprobot = 0;
        this.counter_eproboteater = 0;
        this.counter_plant = 0;

        this.eprobots_created = 0;
    }

    get_terrain(x, y){
        return this.worldarr[x][y];
    }

    world_move(o, old_pos_x, old_pos_y, new_pos_x, new_pos_y){
        var t = this.get_terrain(new_pos_x, new_pos_y);
        t.set_slot_object(o);
        o.t = t;

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());

        var t_old = this.get_terrain(old_pos_x, old_pos_y);
        t_old.set_slot_object(null);

        //this.s.drawer.refresh_paintobj(t_old.x, t_old.y, t_old.get_color());
    }

    world_set(o, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.set_slot_object(o);
        o.t = t;

        if (o.get_id()==OBJECTTYPES.EPROBOT.id){
            this.counter_eprobot++;
            this.eprobots_created++;
        }else if (o.get_id()==OBJECTTYPES.EPROBOTEATER.id){
            this.counter_eproboteater++;
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_unset(x,y, object_class){
        var t = this.get_terrain(x, y);
        t.set_slot_object(null);

        if (object_class==OBJECTTYPES.EPROBOT.id){
            this.counter_eprobot--;
        }else if (object_class==OBJECTTYPES.EPROBOTEATER.id){
            this.counter_eproboteater--;
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_set_energy(o, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.set_energy_object(o);
        o.t = t;

        if (o.get_id()==OBJECTTYPES.PLANT.id){
            this.counter_plant++;
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_unset_energy(x,y, object_class){
        var t = this.get_terrain(x, y);
        t.set_energy_object(null);

        if (object_class==OBJECTTYPES.PLANT.id){
            this.counter_plant--;
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_set_trace_eprobot(val, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.trace_eprobot += val;
    }

    world_set_trace_eproboteater(val, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.trace_eproboteater += val;
    }

    world_unset_trace_eprobot(x,y){
        var t = this.get_terrain(x, y);
        t.set_trace_object_eprobot(null);

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_unset_trace_eproboteater(x,y){
        var t = this.get_terrain(x, y);
        t.set_trace_object_eproboteater(null);

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

}