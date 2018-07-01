class Barrier {

    constructor(s) {
        this.t = null;

        this.s = s;
    }

    toJSON(){
        return {
            id: this.get_id()
        };
    }

    get_id(){
        return OBJECTTYPES.BARRIER;
    }

    get_color(){
        return "rgb(255, 255, 255)";
    }
}