import { Component, Type } from "@wonderlandengine/api";
import { vec3, vec4, quat } from "gl-matrix";

/**
 * Returns an euler angle representation of a quaternion
 * @param  {vec3} out Euler angles, pitch-yaw-roll
 * @param  {quat} mat Quaternion
 * @return {vec3} out
 */
export function getEuler(out, quat) {
  let x = quat[0],
    y = quat[1],
    z = quat[2],
    w = quat[3],
    x2 = x * x,
    y2 = y * y,
    z2 = z * z,
    w2 = w * w;
  let unit = x2 + y2 + z2 + w2;
  let test = x * w - y * z;
  if (test > 0.499995 * unit) { //TODO: Use glmatrix.EPSILON
    // singularity at the north pole
    out[0] = Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else if (test < -0.499995 * unit) { //TODO: Use glmatrix.EPSILON
    // singularity at the south pole
    out[0] = -Math.PI / 2;
    out[1] = 2 * Math.atan2(y, x);
    out[2] = 0;
  } else {
    out[0] = Math.asin(2 * (x * z - w * y));
    out[1] = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
    out[2] = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
  }
  // TODO: Return them as degrees and not as radians
  return out;
}



export class SkyAnimation extends Component {
  static TypeName = "sky-animation";
  static Properties = {
    skyMaterial: { type: Type.Material },
    skyLight: { type: Type.Object },
    sunLight: { type: Type.Object },
  };

  init() {}

  start() {
    /* General */
    this.timeDay = 0;
    this.timeSunset = 0;
    this.timeNight = 0;
    this.skyDay = true;
    this.skySunset = false;
    this.skyNight = false;
    this.skyLightRot = [0, 0, 0];
    this.sunLightRot = [0, 0, 0];

    /* Sky Material Variables */
    this.skyColor0 = [0, 0, 0, 1];
    this.skyColor1 = [0, 0, 0, 1];
    this.skyColor2 = [0, 0, 0, 1];
    this.skyColor3 = [0, 0, 0, 1];

    this.skyColorDay = [
      (this.skyColor0 = [0, 0.58, 1, 1]),
      (this.skyColor1 = [0.65, 1, 0.92, 1]),
      (this.skyColor2 = [0.67, 0.97, 1, 1]),
      (this.skyColor3 = [0.01, 0, 0.26, 1]),
    ];
    this.skyColorSunset = [
      (this.skyColor0 = [0, 0.58, 1, 1]),
      (this.skyColor1 = [0.75, 0.19, 0.25, 1]),
      (this.skyColor2 = [1, 0.58, 0, 1]),
      (this.skyColor3 = [0.01, 0, 0.26, 1]),
    ];
    this.skyColorNight = [
      (this.skyColor0 = [0, 0.58, 1, 1]),
      (this.skyColor1 = [0.09, 0.15, 0.16, 1]),
      (this.skyColor2 = [0.08, 0.11, 0.17, 1]),
      (this.skyColor3 = [0.01, 0, 0.26, 1]),
    ];

    /* Start Cycle */
    this.dayCycle();
  }

  dayCycle() {
    /* Start Day Cycle, After 25sec */
    setTimeout(
      function () {
        this.timeDay = 0;
        this.skyDay = true;
        this.skySunset = false;
        this.skyNight = false;
        this.sunsetCycle();
      }.bind(this),
      25000
    );
  }

  sunsetCycle() {
    /* Start Sunset Cycle, After 25sec */
    setTimeout(
      function () {
        this.timeSunset = 0;
        this.skyDay = false;
        this.skySunset = true;
        this.skyNight = false;
        this.nightCycle();
      }.bind(this),
      25000
    );
  }

  nightCycle() {
    /* Start Night Cycle, After 25sec */
    setTimeout(
      function () {
        this.timeNight = 0;
        this.skyDay = false;
        this.skySunset = false;
        this.skyNight = true;
        this.dayCycle();
      }.bind(this),
      25000
    );
  }

  update(dt) {
    /* Rotations */
    this.skyLightRot = getEuler([0,0,0], this.object.rotationLocal);
    this.sunLightRot = getEuler([0,0,0], this.object.rotationLocal);

    /* Change Sky to Day */
    this.timeDay += dt;
    this.interpolationRatio = this.timeDay / 70; /* Lerp Speed */
    if (this.skyDay) {
      /* Lerp change SkyMaterial to Day */
      vec4.lerp(
        this.skyColor0,
        [
          this.skyMaterial.colorStop0[0],
          this.skyMaterial.colorStop0[1],
          this.skyMaterial.colorStop0[2],
          1,
        ],
        [
          this.skyColorDay[0][0],
          this.skyColorDay[0][1],
          this.skyColorDay[0][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor1,
        [
          this.skyMaterial.colorStop1[0],
          this.skyMaterial.colorStop1[1],
          this.skyMaterial.colorStop1[2],
          1,
        ],
        [
          this.skyColorDay[1][0],
          this.skyColorDay[1][1],
          this.skyColorDay[1][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor2,
        [
          this.skyMaterial.colorStop2[0],
          this.skyMaterial.colorStop2[1],
          this.skyMaterial.colorStop2[2],
          1,
        ],
        [
          this.skyColorDay[2][0],
          this.skyColorDay[2][1],
          this.skyColorDay[2][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor3,
        [
          this.skyMaterial.colorStop3[0],
          this.skyMaterial.colorStop3[1],
          this.skyMaterial.colorStop3[2],
          1,
        ],
        [
          this.skyColorDay[3][0],
          this.skyColorDay[3][1],
          this.skyColorDay[3][2],
          1,
        ],
        this.interpolationRatio
      );
      this.skyMaterial.colorStop0 = this.skyColor0;
      this.skyMaterial.colorStop1 = this.skyColor1;
      this.skyMaterial.colorStop2 = this.skyColor2;
      this.skyMaterial.colorStop3 = this.skyColor3;

      /* Rotate Sun Light */
      if (this.sunLightRot[2] < -60) {
        //this.sunLight.pp_rotateDegrees([0, 0, 0.15]);
        this.sunLight.rotateAxisAngleDeg([0, 0, 1], 0.15*dt);
      }
      /* Rotate Sky Light */
      if (this.skyLightRot[2] < 85) {
        //this.skyLight.pp_rotateDegrees([0, 0, 0.15]);
        this.skyLight.rotateAxisAngleDeg([0, 0, 1], 0.15*dt);
      }
    }

    /* Change Sky to Sunset */
    this.timeSunset += dt;
    this.interpolationRatio = this.timeSunset / 70; /* Lerp Speed */
    if (this.skySunset) {
      /* Lerp change SkyMaterial to Day */
      vec4.lerp(
        this.skyColor0,
        [
          this.skyMaterial.colorStop0[0],
          this.skyMaterial.colorStop0[1],
          this.skyMaterial.colorStop0[2],
          1,
        ],
        [
          this.skyColorSunset[0][0],
          this.skyColorSunset[0][1],
          this.skyColorSunset[0][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor1,
        [
          this.skyMaterial.colorStop1[0],
          this.skyMaterial.colorStop1[1],
          this.skyMaterial.colorStop1[2],
          1,
        ],
        [
          this.skyColorSunset[1][0],
          this.skyColorSunset[1][1],
          this.skyColorSunset[1][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor2,
        [
          this.skyMaterial.colorStop2[0],
          this.skyMaterial.colorStop2[1],
          this.skyMaterial.colorStop2[2],
          1,
        ],
        [
          this.skyColorSunset[2][0],
          this.skyColorSunset[2][1],
          this.skyColorSunset[2][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor3,
        [
          this.skyMaterial.colorStop3[0],
          this.skyMaterial.colorStop3[1],
          this.skyMaterial.colorStop3[2],
          1,
        ],
        [
          this.skyColorSunset[3][0],
          this.skyColorSunset[3][1],
          this.skyColorSunset[3][2],
          1,
        ],
        this.interpolationRatio
      );
      this.skyMaterial.colorStop0 = this.skyColor0;
      this.skyMaterial.colorStop1 = this.skyColor1;
      this.skyMaterial.colorStop2 = this.skyColor2;
      this.skyMaterial.colorStop3 = this.skyColor3;

      /* Rotate Sun Light */
      if (this.sunLightRot[2] < -78) {
        // this.sunLight.pp_rotateDegrees([0, 0, 0.15]);
        this.sunLight.rotateAxisAngleDeg([0, 0, 1], 0.15*dt);
      }
      /* Rotate Sky Light */
      if (this.skyLightRot[2] < 85) {
        // this.skyLight.pp_rotateDegrees([0, 0, 0.15]);
        this.skyLight.rotateAxisAngleDeg([0, 0, 1], 0.15*dt);
      }
    }

    /* Change Sky to Night */
    this.timeNight += dt;
    this.interpolationRatio = this.timeNight / 70; /* Lerp Speed */
    if (this.skyNight) {
      /* Lerp change SkyMaterial to Night */
      vec4.lerp(
        this.skyColor0,
        [
          this.skyMaterial.colorStop0[0],
          this.skyMaterial.colorStop0[1],
          this.skyMaterial.colorStop0[2],
          1,
        ],
        [
          this.skyColorNight[0][0],
          this.skyColorNight[0][1],
          this.skyColorNight[0][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor1,
        [
          this.skyMaterial.colorStop1[0],
          this.skyMaterial.colorStop1[1],
          this.skyMaterial.colorStop1[2],
          1,
        ],
        [
          this.skyColorNight[1][0],
          this.skyColorNight[1][1],
          this.skyColorNight[1][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor2,
        [
          this.skyMaterial.colorStop2[0],
          this.skyMaterial.colorStop2[1],
          this.skyMaterial.colorStop2[2],
          1,
        ],
        [
          this.skyColorNight[2][0],
          this.skyColorNight[2][1],
          this.skyColorNight[2][2],
          1,
        ],
        this.interpolationRatio
      );
      vec4.lerp(
        this.skyColor3,
        [
          this.skyMaterial.colorStop3[0],
          this.skyMaterial.colorStop3[1],
          this.skyMaterial.colorStop3[2],
          1,
        ],
        [
          this.skyColorNight[3][0],
          this.skyColorNight[3][1],
          this.skyColorNight[3][2],
          1,
        ],
        this.interpolationRatio
      );
      this.skyMaterial.colorStop0 = this.skyColor0;
      this.skyMaterial.colorStop1 = this.skyColor1;
      this.skyMaterial.colorStop2 = this.skyColor2;
      this.skyMaterial.colorStop3 = this.skyColor3;

      /* Rotate Sun Light */
      if (this.sunLightRot[2] > -110) {
        //this.sunLight.pp_rotateDegrees([0, 0, -0.1]);
        this.sunLight.rotateAxisAngleDeg([0, 0, 1], -0.1*dt);
      }
      /* Rotate Sky Light */
      if (this.skyLightRot[2] > 0) {
        //this.skyLight.pp_rotateDegrees([0, 0, -0.1]);
        this.sunLight.rotateAxisAngleDeg([0, 0, 1], -0.1*dt);
      }
    }
  }
}
