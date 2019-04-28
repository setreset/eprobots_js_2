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

var ORIENTATIONS = {
    LEFT: 0,
    TOP_LEFT: 1,
    TOP: 2,
    TOP_RIGHT: 3,
    RIGHT: 4,
    BOTTOM_RIGHT: 5,
    BOTTOM: 6,
    BOTTOM_LEFT: 7
}