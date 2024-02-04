function setup() {
  Rectangle.prototype.createVector = createVector;

  players.push(
    new Character(
      [PLAYER_X_OFFSET, centerY],
      PLAYER_SIZE,
      "player1",
      CONTROL_OPTIONS.WS,
    ),
    new Character(
      [SCENE_WIDTH - PLAYER_X_OFFSET, centerY],
      PLAYER_SIZE,
      "player2",
      CONTROL_OPTIONS.MOUSE_WHEEL,
    ),
  );

  ball = new Ball(
    [centerX, centerY],
    BALL_SIZE,
    [BALL_SHIFT * (-1), 0],
  );

  createCanvas(SCENE_WIDTH, SCENE_HEIGHT);
}

function draw() {
  rectMode(CENTER);
  background(0);

  // net
  stroke(255);
  strokeWeight(4);
  noFill();
  drawingContext.setLineDash(NET_DASH);
  line(SCENE_WIDTH / 2, 0, SCENE_WIDTH / 2, SCENE_HEIGHT);

  // moving objects
  noStroke();
  fill(255);

  rect(...ball.mount());
  players.forEach(player => {
    rect(...player.mount());
    player.hitFrameTest();
  });

  ball.hitTest(players);
  ball.hitFrameTest();
}
