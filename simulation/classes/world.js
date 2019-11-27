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

        this.counter_eprobot_init();

        this.counter_plant = 0;

        this.shared_food_storage = 0;
    }

    counter_eprobot_init(){
        for (let eprobot_config of this.s.simconfig){
            this["counter_"+eprobot_config.eprobot_key] = 0;
        }
    }

    counter_eprobot_all(){
        let sum = 0;
        for (let eprobot_config of this.s.simconfig){
            sum += this["counter_"+eprobot_config.eprobot_key];
        }
        return sum;
    }

    get_terrain(x, y){
        return this.worldarr[x][y];
    }

    world_move(o, old_pos_x, old_pos_y, new_pos_x, new_pos_y){
        o.unset_odor_fields();
        var t = this.get_terrain(new_pos_x, new_pos_y);
        t.set_slot_object(o);
        o.position = {x: new_pos_x, y: new_pos_y};
        o.set_odor_fields();

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());

        var t_old = this.get_terrain(old_pos_x, old_pos_y);
        t_old.set_slot_object(null);

        //this.s.drawer.refresh_paintobj(t_old.x, t_old.y, t_old.get_color());
    }

    world_set(o, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.set_slot_object(o);
        o.position = {x: x_pos, y: y_pos};

        if (o.get_id()==OBJECTTYPES.EPROBOT.id || o.get_id()==OBJECTTYPES.PLANT.id){
            this["counter_"+ o.config.eprobot_key]++;
            o.set_odor_fields();
        }else if (o.get_id()==OBJECTTYPES.BARRIER.id){
            o.set_odor_fields();
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_unset(x,y, o){
        var t = this.get_terrain(x, y);
        t.set_slot_object(null);

        if (o.get_id()==OBJECTTYPES.EPROBOT.id || o.get_id()==OBJECTTYPES.PLANT.id){
            this["counter_"+ o.config.eprobot_key]--;
            o.unset_odor_fields();
        }else if (o.get_id()==OBJECTTYPES.BARRIER.id){
            o.unset_odor_fields();
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_set_energy(o, x_pos, y_pos){
        var t = this.get_terrain(x_pos, y_pos);
        t.set_energy_object(o);
        o.position = {x: x_pos, y: y_pos};
        o.set_odor_fields();

        if (o.get_id()==OBJECTTYPES.PLANT.id){
            this.counter_plant++;
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

    world_unset_energy(x,y, o){
        var t = this.get_terrain(x, y);
        t.set_energy_object(null);
        o.unset_odor_fields();

        if (o.get_id()==OBJECTTYPES.PLANT.id){
            this.counter_plant--;
        }

        this.s.drawer.refresh_paintobj(t.x, t.y, t.get_color());
    }

}