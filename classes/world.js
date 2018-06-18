class World {

    constructor(width, height) {
        // init
        this.worldarr = new Array(width);
        for (var x=0;x<this.worldarr.length;x++){
            this.worldarr[x] = new Array(height);
            for (var y=0;y<height;y++){
                this.worldarr[x][y] = new Terrain();
            }
        }

        this.counter_plant = 0;
        this.counter_eprobot = 0;
        this.paintlist = [];
    }

    get_terrain(x, y){
        return this.worldarr[x][y];
    }

    world_set(o){
        var t = this.get_terrain(o.x_pos, o.y_pos);
        t.set_slot_object(o);

        this.paintlist.push({color: o.get_color(), x_pos: o.x_pos, y_pos: o.y_pos});
    }

    world_unset(x,y){
        var t = this.get_terrain(x, y);
        t.set_slot_object(null);
        this.paintlist.push({color: "rgb(255, 255, 255)", x_pos: x, y_pos: y});
    }

}