import { Component, Property } from "@wonderlandengine/api";

/**
 * button-lb-toggle
 */
export class ButtonLbToggle extends Component {
  static TypeName = "button-lb-toggle";
  /* Properties that are configurable in the editor */
  static Properties = {
    buttonMeshObject: Property.object(),
    hoverMaterial: Property.material(),
    textObj: Property.object(),
  };

  start() {
    this.mesh = this.buttonMeshObject.getComponent("mesh");
    this.defaultMaterial = this.mesh.material;

    this.target = this.object.getComponent("cursor-target");
    this.target.addHoverFunction(this.onHover.bind(this));
    this.target.addUnHoverFunction(this.onUnHover.bind(this));
    this.target.addDownFunction(this.onDown.bind(this));
    this.target.addUpFunction(this.onUp.bind(this));

    this.localLB = false; //Local Leaderboard?
  }

  onHover(_, cursor) {
    this.mesh.material = this.hoverMaterial;
    if (cursor.type == "finger-cursor") {
      this.onDown(_, cursor);
    }

    this.hapticFeedback(cursor.object, 0.5, 50);
  }

  onDown(_, cursor) {
    this.buttonMeshObject.translate([0.0, -0.1, 0.0]);
    this.hapticFeedback(cursor.object, 1.0, 20);
  }

  onUp(_, cursor) {
    this.buttonMeshObject.translate([0.0, 0.1, 0.0]);
    this.hapticFeedback(cursor.object, 0.7, 20);

    /* Change Text */
    if (this.localLB) {
      this.textObj.getComponent("text").text = "Global";
      this.localLB = false;
    } else {
      this.textObj.getComponent("text").text = "Local";
      this.localLB = true;
    }
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
}
