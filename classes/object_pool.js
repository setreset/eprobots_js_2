class ObjectPool{
    constructor(o_class) {
        this.o_class = o_class;
        this.objectlist = [];
    }

    get_object(){
        if (this.objectlist.length==0){
            let o = new this.o_class();
            return o;
        }else{
            let o = this.objectlist[0];
            o.length = 0;
            this.objectlist.shift();
            return o;
        }
    }

    return_object(o){
        this.objectlist.push(o);
    }
}