var OBJECTTYPES = {
    PLANT: {
        id: 0,
        drawable: true
    },
    EPROBOT: {
        id: 1,
        drawable: false
    },
    BARRIER: {
        id: 2,
        drawable: true
    }
}

var DIRECTIONS = [
    {x:-1,y:0},  // left
    {x:-1,y:-1}, // top left
    {x:0,y:-1},  // top
    {x:1,y:-1},  // top right
    {x:1,y:0},   // right
    {x:1,y:1},   // bottom right
    {x:0,y:1},   // bottom
    {x:-1,y:1}   // bottom left
];