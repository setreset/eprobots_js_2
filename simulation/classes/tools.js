class SimTools {

    constructor(s) {
        this.s = s;
    }

    mutate_program(mutate_possibility, memory) {
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

    mutate_data(mutate_possibility, memory) {
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
}