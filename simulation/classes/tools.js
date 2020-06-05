class SimTools {

    constructor(s) {
        this.s = s;
    }

    get_mutated_copy__program(mutate_possibility, memory) {
        var new_memory = [];
        for (var i=0;i<memory.length;i++){
            var copyval = memory[i];
            if (Math.random() < mutate_possibility) {
                copyval = this.get_init_val_program();
            }
            new_memory.push(copyval);
        }

        return new_memory;
    }

    get_init_val_program(){
        return tools_random(this.s.settings.PROGRAM_LENGTH);
    }

    get_mutated_copy__data(mutate_possibility, memory) {
        var new_memory = [];
        for (var i=0;i<memory.length;i++){
            var copyval = memory[i];
            if (Math.random() < mutate_possibility) {
                copyval = copyval + this.get_init_val_data();
            }
            new_memory.push(copyval);
        }

        return new_memory;
    }

    get_init_val_data(){
        return tools_random2(-this.s.settings.MUTATE_STRENGTH, this.s.settings.MUTATE_STRENGTH);
    }

    mutation_deletion__program(mutate_possibility, memory) {
        this.mutation_deletion(mutate_possibility, memory, "program");
    }

    mutation_deletion__data(mutate_possibility, memory) {
        this.mutation_deletion(mutate_possibility, memory, "data");
    }

    mutation_deletion(mutate_possibility, memory, func_init) {
        if (Math.random()<mutate_possibility){
            let d_idx = tools_random(memory.length);
            let d_size = tools_random(Math.floor(memory.length/10));

            for (var i=d_idx;i<memory.length;i++){
                if (i+d_size<memory.length){
                    memory[i] = memory[i+d_size];
                }else{
                    if (func_init=="program"){
                        memory[i] = this.get_init_val_program();
                    }else if (func_init=="data"){
                        memory[i] = this.get_init_val_data();
                    }

                }
            }
        }
    }

    mutation_translocation(mutate_possibility, memory) {
        if (Math.random()<mutate_possibility){
            let t_origin_idx = tools_random(memory.length);
            let t_target_idx = tools_random(memory.length);
            let t_size = tools_random(Math.floor(memory.length/10));

            if (t_origin_idx==t_target_idx){
                return;
            }

            // save
            let tmp = [];
            for (var i=0;i<t_size;i++){
                if (t_origin_idx+i<memory.length){
                    tmp.push(memory[t_origin_idx+i])
                }else{
                    break;
                }
            }

            if (t_target_idx>t_origin_idx){
                // aufrücken
                for (var i=t_origin_idx;i<t_target_idx;i++){
                    if ((i+t_size)<memory.length){
                        memory[i] = memory[i+t_size]
                    }else{
                        break;
                    }
                }
            }else{
                // vorrücken
                for (var i=(t_origin_idx+t_size-1);i>=(t_target_idx+t_size);i--){
                    if ((i-t_size)>=0){
                        memory[i] = memory[i-t_size]
                    }else{
                        break;
                    }
                }
            }

            // copy
            for (var i=0;i<tmp.length;i++){
                if ((t_target_idx+i<memory.length)){
                    memory[t_target_idx+i] = tmp[i];
                }else{
                    break;
                }
            }
        }
    }

    mutation_duplication(mutate_possibility, memory,idx_1,idx_2) {
        if (Math.random()<mutate_possibility){
            let d_origin_idx = tools_random(memory.length);
            let d_target_idx = tools_random(memory.length);
            let d_size = tools_random(Math.floor(memory.length/30));

            if (d_origin_idx==d_target_idx){
                return;
            }

            for (var i=0;i<d_size;i++){
                if ((d_target_idx+i)<memory.length && (d_origin_idx+i)<memory.length){
                    memory[d_target_idx+i] = memory[d_origin_idx+i];
                }else{
                    break;
                }
            }
        }
    }
}