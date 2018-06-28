class Barrier {

    constructor(s, x_pos, y_pos) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;

        this.s = s;

        this.s.world.world_set(this);
    }

    get_id(){
        return OBJECTTYPES.BARRIER;
    }

    get_color(){
        return "rgb(0, 0, 0)";
    }
}