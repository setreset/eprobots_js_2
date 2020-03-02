class EprobotAteEater extends EprobotBase{
    try_eat(t_new){
        if (t_new.deadtrace_eprobot_plant>0){

            this.energy+=this.s.settings.energy_profit_plant;
            t_new.deadtrace_eprobot_plant--;
        }
    }
}

eprobot_classes["eprobot_ateeater"] = EprobotAteEater;