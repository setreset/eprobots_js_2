function tools_map_range(value, low1, high1, low2, high2){
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// liefert ganzzahlen von 0 bis max-1
function tools_random(max){
    return Math.floor(Math.random()*max);
}