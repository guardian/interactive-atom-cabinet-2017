function Step(context) {
  this._context = context;
  this._t = 0;
}

Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: {
        this._point = 1; 
        this._context.moveTo(x, y); 
        break;
      }
      case 1: this._point = 2; // proceed
      default: {
        if (this._t <= 0) {
          console.log(this._y)
          
          var xN = Math.abs(x - this._x) * 0.25,
              yN = Math.abs(y - this._y) * 0.25,
              mYb = (this._y < y) ? this._y + yN : this._y - yN,
              mYa = (this._y > y) ? y + yN : y - yN;
          
          this._context.quadraticCurveTo(this._x, this._y, this._x, mYb);
          this._context.lineTo(this._x, mYa);
          this._context.quadraticCurveTo(this._x, y, this._x + xN, y);
          this._context.lineTo(x-xN, y);
          //this._context.quadraticCurveTo(x, y, x, mY);

        } else {
          var x1 = this._x * (1 - this._t) + x * this._t;
          this._context.moveTo(x1, this._y);
          this._context.lineTo(x1, y);
        }
        break;
      }
    }
    this._x = x, this._y = y;
  }
};

export default function roundStep(context) {
  return new Step(context);
}
