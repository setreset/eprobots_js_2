class Eprobot {

    constructor(s, x_pos, y_pos) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;

        this.s = s;

        this.world_register();
    }

    get_id(){
        return OBJECTTYPES.EPROBOT;
    }

    world_register(){
        var t = this.s.world.get_terrain(this.x_pos, this.y_pos);
        t.set_slot_object(this);
    }

    world_unregister(){
        var t = this.s.world.get_terrain(this.x_pos, this.y_pos);
        t.set_slot_object(null);
    }

    go(){
        this.world_unregister();
        this.x_pos = this.s.correct_pos_width(this.x_pos - 1);
        this.world_register();
    }
}