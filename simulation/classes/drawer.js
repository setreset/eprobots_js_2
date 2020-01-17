class Drawer {

    constructor(s, canvas) {
        this.s = s;
        this.canvas = canvas;
        this.canvas_ctx = canvas.getContext('2d', {alpha: false});
        this.x_step = null;
        this.y_step = null;

        this.paintlist = [];
        this.paintobj = {};

        this.init_canvas();
    }

    init_canvas(){
        //console.log("init_canvas");
        let rect = this.canvas.getBoundingClientRect();
        //console.log(rect);
        let c_w = rect.width;
        let c_h = rect.height;

        // korrigieren weil nur der innere bereich angezeigt wird
        this.x_step = c_w / (this.s.world_width_visible);
        this.y_step = c_h / (this.s.world_height_visible);

        this.canvas.width = c_w;
        this.canvas.height = c_h;

        this.canvas_ctx.fillStyle = this.s.settings.background_color[this.s.settings.colortheme];
        this.canvas_ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

        //this.paintobj = {};
        for (var member in this.paintobj) delete this.paintobj[member];
        //this.paintlist = [];
    }

    _paint_fast(ctx){
        for (var key in this.paintobj){
            // skip loop if the property is from prototype
            //if (!this.s.world.paintobj.hasOwnProperty(key)) continue;
            let el = this.paintobj[key];
            ctx.fillStyle = el.color;
            // mit positionskorrektur für zeichenbereich
            ctx.fillRect((el.x_pos - 1) * this.x_step, (el.y_pos - 1) * this.y_step, this.x_step, this.y_step);
        }
    }



    _paint_full(ctx){
        //this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // nur inneren bereich abscannen
        // vorher "for (var x=0;x<this.s.settings.world_width;x++)" (y dito)
        for (var x=1;x<this.s.world_width-1;x++) {
            for (var y = 1; y < this.s.world_height-1; y++) {
                var t = this.s.world.get_terrain(x, y);
                ctx.fillStyle = t.get_color();
                // mit positionskorrektur für zeichenbereich
                ctx.fillRect((x-1) * this.x_step, (y-1) * this.y_step, this.x_step, this.y_step);

            }
        }
    }
}