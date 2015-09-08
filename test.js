var soundID = "Thunder";
var stage = new createjs.Stage("demoCanvas");

var circle = new createjs.Shape();
var bg = new createjs.Shape();

circle.graphics.beginFill('DeepSkyBlue').drawCircle(0, 0, 50);
circle.x = -50;
circle.y = 50;

bg.graphics.beginFill(null).drawCircle(0, 0, 200);
bg.x = 300;
bg.y = 300;

bg.graphics.setStrokeStyle(.5, "round").beginFill('red').moveTo(0, 0).lineTo(5, -5).lineTo(200, 0).lineTo(5, 5).lineTo(0, 0).closePath();
stage.addChild(bg);

createjs.Ticker.setFPS(60);
createjs.Ticker.addEventListener('tick', stage);

function test() {
  var rodom = Math.floor(Math.random() * 360) + 7200;
  console.log(rodom);
  if (!createjs.Tween.hasActiveTweens(bg)) {
    createjs.Tween.get(bg, {override: true})
      .wait(100)
      .to({rotation: rodom}, 10000, createjs.Ease.getPowInOut(3))
      .call(function () {
        bg.rotation = bg.rotation - 7200;
      });
  }
}

function playSound() {
  createjs.Sound.play(soundID);
}

function init() {
  var canvas = document.getElementById('demoCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stage.update();
}

window.onresize = init();