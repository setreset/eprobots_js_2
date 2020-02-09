// absteigend sortieren
//this.eprobots_with_energy.sort(function(a, b){return b.energy - a.energy});
// aufsteigend sortieren
//this.eprobots_with_energy.sort(function(a, b){return a.energy - b.energy});
//shuffle(eprobots_with_energy);
//shuffle(eproboteater_with_energy);

// traces wegräumen
//this.reduce_traces(this.traces_set_eprobots, this.traces_list_eprobots);
//this.reduce_traces(this.traces_set_eproboteaters, "trace_eproboteater", this.traces_list_eproboteaters);

//reduce_traces(trace_set, trace_list){
//    let tl = trace_list.length;
//    if (tl > 0){
//        let trace_cnt = 0;
//        //let traces_list = [...trace_set];
//        let num_tries = Math.min(tl / 100,5);
//
//        while(trace_cnt<num_tries){
//            let cand_index = tools_random(tl);
//            let cand_trace = trace_list[cand_index];
//
//            if (cand_trace.trace_eprobot>0){
//                cand_trace.trace_eprobot = 0;
//                /*cand_trace.trace_eprobot -= 2000;
//                if (cand_trace.trace_eprobot<=0){
//                    cand_trace.trace_eprobot = 0;
//                }*/
//            }
//
//            if (cand_trace.trace_eproboteater>0){
//                cand_trace.trace_eproboteater = 0;
//                /*cand_trace.trace_eproboteater -= 2000;
//                if (cand_trace.trace_eproboteater<=0){
//                    cand_trace.trace_eproboteater = 0;
//                }*/
//            }
//
//            this.drawer.refresh_paintobj(cand_trace.x, cand_trace.y, cand_trace.get_color());
//
//            if (cand_trace.trace_eprobot == 0 && cand_trace.trace_eproboteater == 0){
//                trace_set.delete(cand_trace);
//                trace_list.splice(cand_index, 1);
//                tl--;
//                if (tl==0){
//                    break;
//                }
//            }
//
//            trace_cnt++;
//        }
//    }
//}

//simulation_prestep(){
//    if (this.world.counter_eprobot == 0 && this.world.counter_eproboteater == 0) {
//        this.world.eprobots_created = 0;
//        this.seed_eprobots();
//        //console.log("died");
//        //var duration = (new Date()-this.time_start)/1000;
//        //console.log("duration seconds: "+duration);
//        //console.log("steps: "+this.simulation.steps);
//        //this.stop_simulation();
//        //return;
//    }else if (this.world.eprobots_created > this.settings.eprobots_max * 2 && this.world.counter_eproboteater == 0){
//        //this.seed_eproboteaters();
//    }
//}