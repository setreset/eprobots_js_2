class Drawer {

    constructor(s, canvas, canvas2) {
        this.s = s;
        this.canvas = canvas;
        this.canvas2 = canvas2;
        this.canvas_ctx = canvas.getContext('2d');
        this.canvas2_ctx = canvas2.getContext('2d');
        this.x_step = null;
        this.y_step = null;

        this.init_canvas();
    }

    init_canvas(){
        console.log("init_canvas");
        let rect = this.canvas.getBoundingClientRect();
        console.log(rect);
        let c_w = rect.width;
        let c_h = rect.height;

        this.canvas.width = c_w;
        this.canvas.height = c_h;

        this.canvas2.width = c_w;
        this.canvas2.height = c_h;

        this.x_step = c_w / this.s.settings.world_width;
        this.y_step = c_h / this.s.settings.world_height;
        console.log(this.x_step);
    }

    paint_fast(){
        //this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.s.world.paintlist.forEach(function(el) {
            this.canvas_ctx.fillStyle = el.color;
            this.canvas_ctx.fillRect(el.x_pos * this.x_step, el.y_pos * this.y_step, this.x_step, this.y_step);
        }, this);

        this.s.world.paintlist = [];

        this.paint();
    }

    paint(){
        //this.canvas_ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.canvas2_ctx.clearRect(0, 0, this.canvas2.width, this.canvas2.height);

        for (var x=0;x<this.s.settings.world_width;x++) {
            for (var y = 0; y < this.s.settings.world_height; y++) {
                var t = this.s.world.get_terrain(x, y);
                var o = t.get_slot_object();
                if (o!=null){
                    this.canvas2_ctx.fillStyle = o.get_color();
                    this.canvas2_ctx.fillRect(x * this.x_step, y * this.y_step, this.x_step, this.y_step);
                }

            }
        }
    }
}