function setup() {
  Rectangle.prototype.createVector = createVector;

  mainCharacter = new Character(
    [40, centerY],
    [20, 140],
  );
  ball = new Ball(
    [centerX, centerY],
    [20, 20],
    [BALL_SHIFT * (-1), 0],
  );

  createCanvas(SCENE_WIDTH, SCENE_HEIGHT);
}

function draw() {
  rectMode(CENTER);
  noStroke();
  background(0);
  fill(255);

  rect(...ball.mount());
  rect(...mainCharacter.mount());

  ball.hitTest([mainCharacter]);
  ball.hitFrameTest();
}
