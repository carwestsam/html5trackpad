let OneFingerTap = new ZingTouch.Tap({
  maxDelay: 200,
  numInputs: 1,
  tolerance: 125
});

let TwoFingerTap = new ZingTouch.Tap({
  maxDelay: 200,
  numInputs: 2,
  tolerance: 125
});

let OneFingerPan = new ZingTouch.Pan({
  numInputs: 1,
  threshold: 3
});

let TwoFingerPan = new ZingTouch.Pan({
  numInputs: 2,
  threshold: 3
});

let ThreeFingerPan = new ZingTouch.Pan({
  numInputs: 3,
  threshold: 3
});

let PAN_START = function(inputs) {
  inputs.forEach(input => {
    const progress = input.getGestureProgress(this.getId());
    progress.active = true;
    progress.lastEmitted = {
      x: input.current.x,
      y: input.current.y
    };
  });
};

let PAN_END = function(inputs) {
  inputs.forEach(input => {
    const progress = input.getGestureProgress(this.getId());
    progress.active = false;
  });
  return null;
};

let ActionMouseMove = function(ev) {
  // myElement.textContent = "MouseMove";
  send({
    action: "mousemove",
    x: ev.detail.data[0].change.x || 0,
    y: ev.detail.data[0].change.y || 0
  });
  ev.detail.events.forEach(_e => _e.originalEvent.preventDefault());
};

let ActionDragMove = function(ev) {
  // myElement.textContent = "dragmove";
  send({
    action: "dragmove",
    x: ev.detail.data[0].change.x,
    y: ev.detail.data[0].change.y
  });
};

let ActionScroll = function(ev) {
  // myElement.textContent = "scroll";
  datas = ev.detail.data;
  x = 0;
  y = 0;
  cnt = 1.0;

  for (var i = 0; i < datas.length; i++) {
    if (datas[i].change) {
      cnt += 1;
      x += datas[i].change.y;
      y += datas[i].change.x;
    }
  }
  console.log("scroll", x / cnt, y / cnt);
  send({
    action: "scroll",
    x: x / cnt,
    y: y / cnt
  });
};

let ActionMouseMoveStart = function(inputs) {
  PAN_START.call(this, inputs);
  if (inputs && inputs.length != this.numInputs) return;

  console.log("inputs mousestart", inputs);
  send({ action: "mousemove_start" });
};

let ActionDragMoveStart = function(inputs) {
  PAN_START.call(this, inputs);
  if (inputs && inputs.length != this.numInputs) return;

  console.log("inputs dragstart", inputs);
  send({ action: "dragstart" });
};

let ActionDragMoveEnd = function(inputs) {
  console.log("inputs dragend", inputs, this.numInputs);

  PAN_END.call(this, inputs);
  if (inputs && inputs.length != this.numInputs) return;

  console.log("inputs dragend", inputs);
  send({ action: "dragend" });
};

let ActionLeftClick = function(ev) {
  // myElement.textContent = "ActionLeftClick";
  send({ action: "left_click" });
};

let ActionRightClick = function(ev) {
  // myElement.textContent = "ActionRightClick";
  send({ action: "right_click" });
};

var myElement = document.getElementById("element");
var zt = new ZingTouch.Region(document.body, true, false);

zt.register("OneFingerTap", OneFingerTap);
zt.register("TwoFingerTap", TwoFingerTap);
zt.register("OneFingerPan", OneFingerPan);
zt.register("TwoFingerPan", TwoFingerPan);
zt.register("ThreeFingerPan", ThreeFingerPan);

var url = "ws://192.168.21.101:5678/";
// var url = "wss://6b762789.ngrok.io";
// var url = "ws://localhost:5678"
var ws = new WebSocket(url);

function send(obj) {
  ws.send(JSON.stringify(obj));
}

OneFingerPan.start = ActionMouseMoveStart;
ThreeFingerPan.start = ActionDragMoveStart;
ThreeFingerPan.end = ActionDragMoveEnd;

zt.bind(myElement)
  .TwoFingerTap(ActionRightClick)
  .OneFingerTap(ActionLeftClick)
  .OneFingerPan(ActionMouseMove, false)
  .TwoFingerPan(ActionScroll, false)
  .ThreeFingerPan(ActionDragMove);
