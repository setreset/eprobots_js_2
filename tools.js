function tools_map_range(value, low1, high1, low2, high2){
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// liefert ganzzahlen von 0 bis max-1
function tools_random(max){
    return max * Math.random() << 0;
    //return Math.floor(Math.random()*max);
}

// liefert ganzzahlen von min bis max-1
function tools_random2(min, max){
    var delta = max - min;
    //return Math.floor(Math.random()*delta)+min;
    return (delta * Math.random() << 0) + min;
}

function tools_compute2_arr(op, program_counter, program, data){
    let a, b, c;
    a = Math.abs(program[program_counter + 1]) % data.length;
    b = Math.abs(program[program_counter + 2]) % data.length;
    c = Math.abs(program[program_counter + 3]) % data.length;

    if (op=="add"){
        data[c] = data[a] + data[b];
    }else if(op=="sub"){
        data[c] = data[a] + data[b];
    }else if(op=="mul"){
        data[c] = data[a] * data[b];
    }else if(op=="div"){
        if (data[b]!=0) {
            data[c] = Math.floor(data[a] / data[b]);
        }
    }else if(op=="and"){
        data[c] = data[a] & data[b];
    }else if(op=="or"){
        data[c] = data[a] | data[b];
    }else if(op=="xor"){
        data[c] = data[a] ^ data[b];
    }else if(op=="not"){
        data[c] = ~ data[b];
    }

    if (!isFinite(data[c])){
        data[c] = tools_random2(-10000,10000);
    }
}

function tools_compute2(program, data, PS) {
    var program_counter = 0;
    var step_counter = 0;
    var opcode;
    var a, b, c;

    while (program_counter >= 0 && step_counter < PS) {
        opcode = program[program_counter];
        opcode = Math.abs(opcode) % 13;

        if (opcode==0){ // jmp
            a = program[program_counter + 1] % program.length;

            program_counter = a

        }else if (opcode==1){ // add
            tools_compute2_arr("add", program_counter, program, data);

            program_counter += 4

        }else if (opcode==2){ // sub
            tools_compute2_arr("sub", program_counter, program, data);

            program_counter += 4

        }else if (opcode==3){ // mul
            tools_compute2_arr("mul", program_counter, program, data);

            program_counter += 4

        }else if (opcode==4){ // div
            tools_compute2_arr("div", program_counter, program, data);

            program_counter += 4

        }else if (opcode==5){
            tools_compute2_arr("and", program_counter, program, data);

            program_counter += 4
        }else if (opcode==6){
            tools_compute2_arr("or", program_counter, program, data);

            program_counter += 4
        }else if (opcode==7){
            tools_compute2_arr("xor", program_counter, program, data);

            program_counter += 4
        }else if (opcode==8){
            tools_compute2_arr("not", program_counter, program, data);

            program_counter += 4

        }else if (opcode==9){ // move
            a = Math.abs(program[program_counter + 1]) % data.length;
            b = Math.abs(program[program_counter + 2]) % data.length;
            data[a] = data[b];

            program_counter += 3

        }else if (opcode==10){ // beq
            a = Math.abs(program[program_counter + 1]) % data.length;
            b = program[program_counter + 2] % program.length;

            if (data[a]<=0){
                program_counter = b
            }else{
                program_counter += 3
            }
        }else if (opcode==11){ // beq
            a = Math.abs(program[program_counter + 1]) % data.length;
            b = program[program_counter + 2] % program.length;

            if (data[a]>0){
                program_counter = b
            }else{
                program_counter += 3
            }
        }else if (opcode==12){ // quit
            program_counter = -1
        }

        step_counter++;
    }
    return step_counter;
}

// subleq: https://en.wikipedia.org/wiki/One_instruction_set_computer
function tools_compute(program, data, PS) {
    var program_counter = 0;
    var step_counter = 0;
    var a, b, c;

    while (program_counter >= 0 && (program_counter + 2) < program.length && step_counter < PS) {
        a = program[program_counter];
        b = program[program_counter + 1];
        c = program[program_counter + 2];

        a = a % data.length;
        b = b % data.length;
        c = c % program.length;

        //a = Math.abs(a % memory.length);
        //b = Math.abs(b % memory.length);
        //c = Math.abs(c % memory.length);

        if (a < 0 || b < 0) {
            program_counter = -1;
        }else{
            if (b>50){
                data[b] = data[b] - data[a];
            }

            if (!isFinite(data[b])){
                data[b] = tools_random2(-10000,10000);
            }
            if (data[b] > 0) {
                program_counter = program_counter + 3;
            } else {
                //c = memory[program_counter + 2];
                //c = c % memory.length;
                program_counter = c;
            }
        }
        step_counter++;
    }
    return step_counter;
}

function tools_crossover(m_pos, m_strength, memory_a, memory_b) {
    // evt. swap
    if (tools_random(2)==1){
        let memory_c;
        memory_c=memory_a;
        memory_b=memory_a;
        memory_a=memory_c;
    }

    var new_memory = [];
    let co_index = tools_random(memory_a.length);
    for (let i=0;i<memory_a.length;i++){
        if (i<co_index){
            new_memory.push(memory_a[i]);
        }else{
            new_memory.push(memory_b[i]);
        }
    }

    //if (tools_random(10)<2){
    new_memory = tools_mutate(m_pos, m_strength, new_memory);
    //}

    return new_memory;
}

function makeid(nchars){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < nchars; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
};

Date.prototype.today = function () {
    let part_date = ((this.getDate() < 10)?"0":"") + this.getDate();
    let part_month = (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1);

    return part_date+"."+part_month+"."+this.getFullYear();
};


function get_current_datetime_str(){
    var newDate = new Date();
    return newDate.today() + " " + newDate.timeNow();
}

function log(msg){
    console.log(get_current_datetime_str()+" " + msg);
}

function maze(x,y) {
    var n=x*y-1;
    if (n<0) {alert("illegal maze dimensions");return;}
    var horiz =[];
    for (var j= 0; j<x+1; j++) {horiz[j]= []};
    var verti =[];
    for (var j= 0; j<x+1; j++) {verti[j]= []};
    var here = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)];
    var path = [here];
    var unvisited = [];

    for (var j = 0; j<x+2; j++) {
        unvisited[j] = [];
        for (var k= 0; k<y+1; k++){
            unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
        }
    }

    var next;
    while (0 < n) {
        var potential = [[here[0] + 1, here[1]], [here[0], here[1] + 1],
            [here[0] - 1, here[1]], [here[0], here[1] - 1]];
        var neighbors = [];
        for (var j = 0; j < 4; j++){
            if (unvisited[potential[j][0] + 1][potential[j][1] + 1]){
                neighbors.push(potential[j]);
            }
        }

        if (neighbors.length) {
            n = n - 1;
            next = neighbors[Math.floor(Math.random() * neighbors.length)];
            unvisited[next[0] + 1][next[1] + 1] = false;

            if (next[0] == here[0]){
                horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
            }else{
                verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
            }

            path.push(here = next);
        } else{
            here = path.pop();
        }
    }
    return {x: x, y: y, horiz: horiz, verti: verti};
}

function maze_display(m) {
    var text = [];

    for (var j= 0; j<m.x*2+1; j++) {
        var line= [];
        if (j%2 == 0)
            for (var k=0; k<m.y*4+1; k++)
                if (0 == k%4)
                    line[k]= '+';
                else
                if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
                    line[k]= ' ';
                else
                    line[k]= '-';
        else
            for (var k=0; k<m.y*4+1; k++)
                if (0 == k%4)
                    if (k>0 && m.horiz[(j-1)/2][k/4-1])
                        line[k]= ' ';
                    else
                        line[k]= '|';
                else
                    line[k]= ' ';
        if (0 == j) line[1]= line[2]= line[3]= ' ';
        if (m.x*2-1 == j) line[4*m.y]= ' ';
        text.push(line.join('')+'\r\n');
    }
    return text.join('');
}

function tools_modulo_with_wrap(number, max){
    number = number % max;
    if (number<0){
        number = max + number;
    }
    return number;
}

function tools_negative_to_0(number){
    if (number<0){
        return 0;
    }else{
        return number;
    }
}

function play_tone(synth, note, propability, sound){
    //play a middle 'C' for the duration of an 8th note
    if (sound && Math.random()<propability){
        synth.triggerAttackRelease(note, "8n");
    }
}

function send_metric(m_name, m_value){
    log("send_metric "+m_name+": "+m_value);
    //$.ajax({
    //    "type": "get",
    //    "url": "http://localhost:3000",
    //    "data": {
    //        m_name: m_name,
    //        m_value: m_value
    //    }
    //});
}