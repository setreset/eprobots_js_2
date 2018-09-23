class Drawer {

    constructor(s, canvas, canvas2) {
        this.s = s;
        this.canvas = canvas;
        this.canvas2 = canvas2;
        this.canvas_ctx = canvas.getContext('2d', {alpha: false});
        this.canvas2_ctx = canvas2.getContext('2d', {alpha: false});
        this.x_step = null;
        this.y_step = null;

        this.paintlist = [];
        this.paintobj = {};

        this.init_canvas();
    }

    init_canvas(){
        console.log("init_canvas");
        let rect = this.canvas.getBoundingClientRect();
        //console.log(rect);
        let c_w = rect.width;
        let c_h = rect.height;

        this.x_step = c_w / this.s.settings.world_width;
        this.y_step = c_h / this.s.settings.world_height;

        this.canvas.width = c_w;
        this.canvas.height = c_h;

        this.canvas2.width = c_w;
        this.canvas2.height = c_h;

        this.canvas_ctx.fillStyle = this.s.settings.background_color;
        this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvas2_ctx.fillStyle = this.s.settings.background_color;
        this.canvas2_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    refresh_paintobj(x, y, color){
        let coord = x.toString() + ":" + y.toString();
        this.paintobj[coord] = {color: color, x_pos: x, y_pos: y};
        //this.paintlist.push({color: o.get_color(), x_pos: o.x_pos, y_pos: o.y_pos});
    }

    paint_full(){
        this._paint_full(this.canvas_ctx);
    }

    paint_fast(){
        this._paint_fast(this.canvas_ctx);
        //this._paint_full(this.canvas_ctx);

        this.paintobj = {};
        //this.paintlist = [];
    }

    _paint_fast(ctx){
        for (var key in this.paintobj){
            // skip loop if the property is from prototype
            //if (!this.s.world.paintobj.hasOwnProperty(key)) continue;
            let el = this.paintobj[key];
            ctx.fillStyle = el.color;
            ctx.fillRect(el.x_pos * this.x_step, el.y_pos * this.y_step, this.x_step, this.y_step);
        }

        //this.s.world.paintlist.forEach(function(el) {
        //    ctx.fillStyle = el.color;
        //    ctx.fillRect(el.x_pos * this.x_step, el.y_pos * this.y_step, this.x_step, this.y_step);
        //}, this);
        //
    }



    _paint_full(ctx){
        //this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (var x=0;x<this.s.settings.world_width;x++) {
            for (var y = 0; y < this.s.settings.world_height; y++) {
                var t = this.s.world.get_terrain(x, y);
                ctx.fillStyle = t.get_color();
                ctx.fillRect(x * this.x_step, y * this.y_step, this.x_step, this.y_step);

            }
        }
    }
}