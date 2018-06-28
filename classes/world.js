class World {

    constructor(s, width, height) {
        this.s = s;

        // init
        this.worldarr = new Array(width);
        for (var x=0;x<this.worldarr.length;x++){
            this.worldarr[x] = new Array(height);
            for (var y=0;y<height;y++){
                this.worldarr[x][y] = new Terrain(s);
            }
        }

        this.counter_plant = 0;
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

    world_set(o){
        var t = this.get_terrain(o.x_pos, o.y_pos);
        t.set_slot_object(o);

        this.refresh_paintobj(t, o.x_pos, o.y_pos);
    }

    world_set_energy(o){
        var t = this.get_terrain(o.x_pos, o.y_pos);
        t.set_energy_object(o);

        this.refresh_paintobj(t, o.x_pos, o.y_pos);
    }

    world_unset(x,y){
        var t = this.get_terrain(x, y);
        t.set_slot_object(null);

        this.refresh_paintobj(t, x, y);
    }

    world_unset_energy(x,y){
        var t = this.get_terrain(x, y);
        t.set_energy_object(null);

        this.refresh_paintobj(t, x, y);
    }

}