import { Component, Type } from "@wonderlandengine/api";

const tempVec = new Float32Array(3);
const tempQuat = new Float32Array(8);

export class Obstacle extends Component {
  static TypeName = "obstacle";
  static Properties = {
    resetLocZ: { type: Type.Float, default: -44 },
    limitZ: { type: Type.Float, default: 2 },
  };

  init() {
    this.startPosition = new Float32Array(3);
  }

  start() {
    window.addEventListener("reset-game", this.reset.bind(this));
    this.object.getPositionWorld(this.startPosition);
  }

  update(dt) {
    /* Move */
    if (!window.gameOver) {
      this.move(dt);
    }
  }

  move(dt) {
    /* Move */
    tempVec[2] = 3 * dt;
    this.object.translateLocal(tempVec);

    /* Wrap around */
    this.object.getTransformWorld(tempQuat);
    if (tempQuat[6] > this.limitZ) {
      tempVec[2] = this.resetLocZ;
      this.object.translateLocal(tempVec);
    }
  }

  reset() {
    this.object.setPositionWorld(this.startPosition); // Reset locations
  }
}
