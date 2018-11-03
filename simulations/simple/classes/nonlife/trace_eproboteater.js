class TraceEprobotEater {

    constructor(s, color) {
        this.t = null;

        this.s = s;
        this.created = s.steps;
        this.color = color;
    }

    toJSON(){
        return {
            id: this.get_id(),
            x_pos: this.t.x,
            y_pos: this.t.y
        };
    }

    get_id(){
        return OBJECTTYPES.TRACE_EPROBOTEATER.id;
    }

    get_color(){
        return this.color;
    }
}