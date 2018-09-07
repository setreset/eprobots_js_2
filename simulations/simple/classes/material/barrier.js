class Barrier_simple {

    constructor(s) {
        this.t = null;

        this.s = s;
    }

    toJSON(){
        return {
            id: this.get_id(),
            x_pos: this.t.x,
            y_pos: this.t.y,
        };
    }

    get_id(){
        return OBJECTTYPES_simple.BARRIER.id;
    }

    get_color(){
        return OBJECTTYPES_simple.BARRIER.color;
    }
}