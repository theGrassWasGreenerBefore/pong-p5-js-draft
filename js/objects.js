const getAxisOverlap = (coord1, coord2, size1, size2) => {
  const currentDistance = Math.abs(coord1 - coord2);
  const minimumSafeDistance = (size1 + size2) / 2;
  return currentDistance < minimumSafeDistance;
};

const INTERPOLATION_FREQUENCY = 4;

class Rectangle {
  constructor(
    position = [0, 0],
    sizeCaret = [0, 0],
    velocity = [0, 0]
  ) {
    this.init(position, sizeCaret, velocity);
  };

  init(position, sizeCaret, velocity) {
    this.position = this.createVector(...position);
    this.size = { width: sizeCaret[0], height: sizeCaret[1] };
    this.velocity = this.createVector(...velocity);
  }

  shiftByVelocity() {
    this.position.add(this.velocity);
  }

  mount() {
    const {
      position: { x, y },
      size: { width, height }
    } = this;

    return [x, y, width, height];
  }
};

class Paddle extends Rectangle {
  constructor(
    position,
    sizeCaret,
    name = "",
    controlOption = CONTROL_OPTIONS.WS,
  ) {
    super(position, sizeCaret);
    this.name = name;
    this.controlOption = controlOption;
  }

  verticalShift(yDirection) {
    this.velocity.y = yDirection * KEYBOARD_SHIFT;
  }

  hitFrameTest() {
    const { position: { y } } = this;
    const { velocity: { y: velocityY } } = this;
    const { size: { height } } = this;

    const topLimit = height / 2;
    const bottomLimit = SCENE_HEIGHT - height / 2;

    const isHigherThanTop = (velocityY <= 0) && (y <= topLimit);
    const isLowerThanBottom = (velocityY >= 0) && (y >= bottomLimit);

    if (isHigherThanTop || isLowerThanBottom) {
      this.velocity.y = 0;
      this.position.y = isHigherThanTop ? topLimit : bottomLimit;
    }
  }

  mount() {
    if (this.controlOption === CONTROL_OPTIONS.MOUSE_WHEEL) {
      const resultMount = super.mount();
      this.velocity.y = 0;
      return resultMount;
    }
    return super.mount();
  }
};

class Ball extends Rectangle {
  constructor(
    position,
    sizeCaret,
    velocity = [0, 0],
  ) {
    super(position, sizeCaret, velocity);
    this.isShown = true;
    this.pauseValue = PAUSE_INITIAL_VALUE;
  }

  interpolateByVelocity(paddles) {
    const { position, size, velocity: { x, y } } = this;

    for (let part = 0; part < INTERPOLATION_FREQUENCY; part++) {
      const hypotheticVelocity = this.createVector(
        x * (part + 1) / INTERPOLATION_FREQUENCY,
        y * (part + 1) / INTERPOLATION_FREQUENCY
      );
      const hypotheticBall = {
        position: position.copy().add(hypotheticVelocity),
        size: { ...size },
      }

      if (paddles.map(paddle => isThereOverlap(hypotheticBall, paddle)).some(isOverlap => isOverlap)) {
        return hypotheticVelocity;
      }
    }

    return this.velocity;
  }

  shiftByVelocity(paddles) {
    if (this.isShown) {
      this.position.add(this.interpolateByVelocity(paddles));
    } else {
      this.position.add(this.velocity);
    }
  }

  hitCallback(paddle) {
    const {
      position: { x: ballX, y: ballY },
      velocity: ballVelocity,
    } = this;
    const {
      position: { x: paddleX, y: paddleY },
      size: { height },
      velocity: paddleVelocity,
    } = paddle;

    const hitDirection = this.createVector(ballX - paddleX, ballY - paddleY).add(paddleVelocity);

    const angle = Math.round(hitDirection.heading() / Math.PI * 180);
    const angleSign = Math.sign(angle);
    if ((Math.abs(angle) >= 90) && (Math.abs(angle) < 90 + ANGLE_LIMIT)) {
      hitDirection.x = Math.cos((90 + ANGLE_LIMIT) * Math.PI / 180);
      hitDirection.y = Math.sin((90 + ANGLE_LIMIT) * Math.PI / 180);
    }
    if ((Math.abs(angle) < 90) && (Math.abs(angle) > 90 - ANGLE_LIMIT)) {
      hitDirection.x = Math.cos((90 - ANGLE_LIMIT) * Math.PI / 180) * angleSign;
      hitDirection.y = Math.sin((90 - ANGLE_LIMIT) * Math.PI / 180) * angleSign;
    }

    this.velocity = hitDirection.normalize().mult(ballVelocity.mag());
  }

  hitTest(paddles) {
    paddles.forEach(paddle => {
      if (isThereOverlap(this, paddle)) {
        this.hitCallback(paddle);
      }
    });
  }

  hitFrameTest() {
    const { isShown } = this;
    const {
      position: { x, y },
      size: { width, height },
    } = this;

    if (isShown && (x < width / 2)) {
      score[1] += 1;
      this.isShown = false;
      this.setBeforeServe(-1);
    }
    if (isShown && (x > SCENE_WIDTH - width / 2)) {
      score[0] += 1;
      this.isShown = false;
      this.setBeforeServe(1);
    }
    if ((y < height / 2) && (y < 0)) {
      this.velocity.y *= -1;
    }
    if ((y > SCENE_HEIGHT - height / 2) && (y > 0)) {
      this.velocity.y *= -1;
    }
  }

  drawIfShown(rect) {
    if (this.isShown) {
      rect(...this.mount());
    } else {
      const {
        position: { x },
        velocity: { x: velocityX },
      } = this;

      this.pauseValue -= 1;
      if (
        velocityX > 0 && (x > SCENE_WIDTH / 2) ||
        velocityX < 0 && (x < SCENE_WIDTH / 2)
      ) {
        this.isShown = true;
        this.pauseValue = PAUSE_INITIAL_VALUE;
      }
      if (this.pauseValue <= 0) {
        this.isShown = true;
        this.pauseValue = PAUSE_INITIAL_VALUE;
        this.init(
          ...generateServeCoordinates(Math.sign(this.velocity.x))
        );
      }
    }
  }

  setBeforeServe(preferredXDirection) {
    if (preferredXDirection > 0) {
      this.position.x = this.size.width / 2 + 1;
    } else {
      this.position.x = SCENE_WIDTH - this.size.width / 2 - 1;
    }
  }
};
