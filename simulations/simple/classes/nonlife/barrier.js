class Barrier {

    constructor(s) {
        this.t = null;

        this.s = s;
    }

    //toJSON(){
    //    return {
    //        id: this.get_id(),
    //        x_pos: this.t.x,
    //        y_pos: this.t.y,
    //    };
    //}

    get_id(){
        return OBJECTTYPES.BARRIER.id;
    }

    get_color(){
        return OBJECTTYPES.BARRIER.color[this.s.settings.colortheme];
    }
}