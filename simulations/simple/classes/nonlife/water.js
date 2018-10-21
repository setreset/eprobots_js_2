class Water {

    constructor(s) {
        this.t = null;

        this.s = s;
        this.energy_count = 100; //1000;
    }

    toJSON(){
        return {
            id: this.get_id(),
            x_pos: this.t.x,
            y_pos: this.t.y,
            energy_count: this.energy_count
        };
    }

    get_id(){
        return OBJECTTYPES.WATER.id;
    }

    get_color(){
        return OBJECTTYPES.WATER.color;
    }
}