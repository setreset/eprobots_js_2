class Eprobot {

    constructor(s, x_pos, y_pos, program, init_data) {
        this.x_pos = x_pos;
        this.y_pos = y_pos;

        this.s = s;
        this.tick = 0;
        this.is_dead = false;
        this.energy = 0;

        this.program = program;

        this.init_data = init_data;
        this.working_data = init_data.slice(0);

        this.s.world.world_set(this);
        this.s.world.counter_eprobot++;

        this.new_eprobot = null;
    }

    get_id(){
        return OBJECTTYPES.EPROBOT;
    }

    get_color(){
        return "rgb(255, 0, 0)";
    }

    get_lifetime(){
        return this.s.settings.eprobots_lifetime;
    }

    kill(){
        this.s.world.world_unset(this.x_pos, this.y_pos);
        this.s.world.counter_eprobot--;
        this.is_dead = true;
    }

    get_move(){
        return this.tick % (DIRECTIONS.length+1);
    }

    get_move_random(){
        return tools_random(DIRECTIONS.length+1);
    }

    get_move_OISC(){
        tools_compute(this.program, this.working_data, this.s.settings.PROGRAM_STEPS);

        var move_val = this.working_data[0];

        if (isFinite(move_val)){
            var move = Math.abs(move_val) % (DIRECTIONS.length + 1);
        }else{
            console.log("Infinite: "+move_val);
            var move = this.get_move_random();
        }

        return move;
    }

    step(){
        //let moveval = this.get_move();
        let moveval = this.get_move_OISC();

        // move
        if (moveval<DIRECTIONS.length){
            let vec = DIRECTIONS[moveval];
            let movepos_x = this.s.correct_pos_width(this.x_pos + vec.x);
            let movepos_y = this.s.correct_pos_height(this.y_pos + vec.y);

            let t = this.s.world.get_terrain(movepos_x, movepos_y);
            let slot_object = t.get_slot_object();
            let energy_object = t.get_energy_object();
            if (slot_object == null){
                if (energy_object){
                    //slot_object.kill();
                    this.energy++;
                    energy_object.energy_count--;
                    if (energy_object.energy_count==0){
                        this.s.world.world_unset_energy(movepos_x, movepos_y);
                        console.log(new Date()+": entferne pflanze");
                    }
                }
                this.s.world.world_unset(this.x_pos, this.y_pos);
                this.x_pos = movepos_x;
                this.y_pos = movepos_y;
                this.s.world.world_set(this);
            }
        }

        if (this.energy > 0 && this.s.world.counter_eprobot<this.s.settings.eprobots_max){
            // new eprobot
            let spreadval = tools_random(8);
            let vec = DIRECTIONS[spreadval];
            let spreadpos_x = this.s.correct_pos_width(this.x_pos + vec.x);
            let spreadpos_y = this.s.correct_pos_height(this.y_pos + vec.y);
            //let spreadpos_x = this.s.settings.nest_x+tools_random2(-20,20);
            //let spreadpos_y = this.s.settings.nest_y+tools_random2(-20,20);
            let spreadterrain = this.s.world.get_terrain(spreadpos_x, spreadpos_y);
            if (spreadterrain.slot_object == null){
                var new_program = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.program);
                var new_data = tools_mutate(this.s.settings.MUTATE_POSSIBILITY, this.s.settings.MUTATE_STRENGTH, this.init_data);
                this.new_eprobot = new Eprobot(this.s, spreadpos_x, spreadpos_y, new_program, new_data);
                this.energy--;
            }
        }

        this.tick++;
    }
}