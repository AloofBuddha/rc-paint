/* SETUP */
var canvas = document.getElementById('canvas');
var clearButton = document.getElementById('clear');
var colorPicker = document.getElementById('colorpicker');
var context = canvas.getContext("2d");
context.lineWidth = 5;
context.lineJoin = 'round';
context.lineCap = 'round';
context.strokeStyle = colorPicker.value;

/* RAW EVENT STREAMS */
var mousedown$ = Rx.Observable.fromEvent(canvas, 'mousedown');
var mousemove$ = Rx.Observable.fromEvent(canvas, 'mousemove');
var mouseup$ = Rx.Observable.fromEvent(canvas, 'mouseup');
var clearClick$ = Rx.Observable.fromEvent(clearButton, 'click');
var colorPick$ = Rx.Observable.fromEvent(colorPicker, 'input');

/* COMPOSED EVENT STREAMS */
// stream of mousemove events between a mousedown and a mouseup
var mousedrag$ = mousedown$.flatMap(() =>
  mousemove$
  .startWith(null) // so we know when a new stream starts
  .takeUntil(mouseup$));

// stream of { curr, next } mouseevent
var mouseDragPrevNext$ = Rx.Observable.zip(
  mousedrag$,
  mousedrag$.skip(1), 
  (curr, next) => ({curr, next}) // this is cool ES6 shorthand
);

/* SUBSCRIBE TO EVENT STREAMS */
// paint a dot on mousedown
mousedown$.subscribe(({offsetX, offsetY}) => {
  paintLine(offsetX, 
            offsetY,
            offsetX + .1, 
            offsetY + .1);
  //console.log(offsetX, offsetY);
});

// paint a line on mousedrag
mouseDragPrevNext$.subscribe(({curr, next}) => {
  if (curr && next)
    paintLine(curr.offsetX, 
              curr.offsetY,
              next.offsetX, 
              next.offsetY);
  //console.log(curr, next);
});

// clear canvas on button click
clearClick$.subscribe(() => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  //console.log('clear clicked');
});

// set new color
colorPick$.subscribe(colorObj => {
  context.strokeStyle = colorObj.target.value;
  //console.log(colorObj);
});

/* HELPER */
function paintLine(x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.stroke();
};