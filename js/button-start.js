import { Component, Type } from "@wonderlandengine/api";
import { HowlerAudioSource } from "@wonderlandengine/components";

/**
 * Helper function to trigger haptic feedback pulse.
 *
 * @param {Object} object An object with 'input' component attached
 * @param {number} strength Strength from 0.0 - 1.0
 * @param {number} duration Duration in milliseconds
 */
export function hapticFeedback(object, strength, duration) {
  const input = object.getComponent("input");
  if (input && input.xrInputSource) {
    const gamepad = input.xrInputSource.gamepad;
    if (gamepad && gamepad.hapticActuators)
      gamepad.hapticActuators[0].pulse(strength, duration);
  }
}

export class ButtonStart extends Component {
  static TypeName = "button-start";
  static Properties = {
    buttonMeshObject: { type: Type.Object },
    hoverMaterial: { type: Type.Material },
  };
  static Dependencies = [HowlerAudioSource];

  start() {
    this.mesh = this.buttonMeshObject.getComponent("mesh");
    this.defaultMaterial = this.mesh.material;

    this.target = this.object.getComponent("cursor-target");
    this.target.addHoverFunction(this.onHover.bind(this));
    this.target.addUnHoverFunction(this.onUnHover.bind(this));
    this.target.addDownFunction(this.onDown.bind(this));
    this.target.addUpFunction(this.onUp.bind(this));

    this.hide(false);
  }

  onHover(_, cursor) {
    this.mesh.material = this.hoverMaterial;
    if (cursor.type == "finger-cursor") {
      this.onDown(_, cursor);
    }

    hapticFeedback(cursor.object, 0.5, 50);
  }

  onDown(_, cursor) {
    this.buttonMeshObject.translate([0.0, -0.1, 0.0]);
    hapticFeedback(cursor.object, 1.0, 20);
  }

  onUp(_, cursor) {
    this.buttonMeshObject.translate([0.0, 0.1, 0.0]);
    this.hapticFeedback(cursor.object, 0.7, 20);

    //Replay
    window.gameOver = false;
    window.dispatchEvent(new Event("reset-game"));

    //hide
    this.hide(true);
  }

  onUnHover(_, cursor) {
    this.mesh.material = this.defaultMaterial;
    if (cursor.type == "finger-cursor") {
      this.onUp(_, cursor);
    }

    this.hapticFeedback(cursor.object, 0.3, 50);
  }

  hapticFeedback(object, strength, duration) {
    const input = object.getComponent("input");
    if (input && input.xrInputSource) {
      const gamepad = input.xrInputSource.gamepad;
      if (gamepad && gamepad.hapticActuators)
        gamepad.hapticActuators[0].pulse(strength, duration);
    }
  }

  hide(b) {
    if (b == true) {
      this.object.parent.setPositionWorld([0, 0, 100]);
    } else {
      this.object.parent.setPositionWorld([0.0, 1.6, -0.5]);
    }
  }
}
