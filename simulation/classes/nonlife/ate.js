class Ate {

    constructor(s) {
        this.position_x = null;
        this.position_y = null;

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
        return OBJECTTYPES.ATE.id;
    }

    get_color(){
        return OBJECTTYPES.ATE.color[this.s.settings.colortheme];
    }
}