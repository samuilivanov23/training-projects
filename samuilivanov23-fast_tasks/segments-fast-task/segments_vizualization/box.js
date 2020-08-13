function Box(size, color){
    this.size = size;
    this.color = color;

    this.show = function(x, y){
        fill(this.color);
        stroke(255);
        rect(x, y, this.size, this.size);
    }
}