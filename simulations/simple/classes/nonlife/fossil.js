class Fossil {

    constructor(s, color) {
        this.t = null;

        this.s = s;
        this.created = s.steps;
    }

    toJSON(){
        return {
            id: this.get_id(),
            x_pos: this.t.x,
            y_pos: this.t.y
        };
    }

    get_id(){
        return OBJECTTYPES.FOSSIL.id;
    }

    get_color(){
        return OBJECTTYPES.FOSSIL.color;
    }
}