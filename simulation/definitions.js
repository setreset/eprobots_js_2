var OBJECTTYPES = {
    PLANT: {
        id: 0,
        color: {
            dark: "rgb(0, 255, 0)",
            bright: "rgb(0, 255, 0)"
        },

        drawable: true
    },
    EPROBOT: {
        id: 1,
        color: {
            dark: "rgb(255, 0, 0)",
            bright: "rgb(148, 0, 0)"
        },
        drawable: false
    },
    EPROBOTEATER: {
        id: 2,
        drawable: false,
        color: {
            dark: "rgb(0, 200, 250)",
            bright: "rgb(0, 3, 158)"
        },
    },
    BARRIER: {
        id: 3,
        color: {
            dark: "rgb(255, 255, 255)",
            bright: "rgb(0, 0, 0)"
        },
        drawable: true
    },
    ATE: {
        id: 4,
        color: {
            dark: "rgb(164, 99, 14)",
            bright: "rgb(0, 0, 0)"
        },
        drawable: false
    },
}