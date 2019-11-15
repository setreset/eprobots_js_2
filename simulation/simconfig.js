var simconfig = [

    {
        "eprobot_key": "eprobot_a",
        "eprobot_class": Eprobot,
        "base_color": 0,
        "special_energy": true,
        "special_energy_consume_fields": ["eprobot_b"],
        "special_energy_no_go_fields": ["eprobot_a"],
        "individuals_max": 500

    },
    {
        "eprobot_key": "eprobot_b",
        "eprobot_class": Eprobot,
        "base_color": 90,
        "special_energy": true,
        "special_energy_consume_fields": ["eprobot_a"],
        "special_energy_no_go_fields": ["eprobot_b"],
        "individuals_max": 500
    },
    {
        "eprobot_key": "eprobot_p",
        "eprobot_class": EprobotParasit,
        "base_color": 180,
        "special_energy": false,
        "special_energy_consume_fields": ["eprobot_a", "eprobot_b"],
        "special_energy_no_go_fields": [],
        "individuals_max": 200
    },
    {
        "eprobot_key": "eproboteater_a",
        "eprobot_class": EprobotEater,
        "base_color": 270,
        "special_energy": false,
        "special_energy_no_go_fields": ["eprobot_a", "eprobot_b"],
        "individuals_max": 200
    },
    //{
    //    "eprobot_key": "eproboteater_b",
    //    "eprobot_class": EprobotEater,
    //    "base_color": 270,
    //    "special_energy": false,
    //    "individuals_max": 300
    //}
];