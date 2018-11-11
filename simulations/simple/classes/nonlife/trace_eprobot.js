class TraceEprobot {

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
            y_pos: this.t.y,
            created: this.created,
            color: this.color
        };
    }

    get_id(){
        return OBJECTTYPES.TRACE_EPROBOT.id;
    }

    get_color(){
        return this.color;
    }
}