import { Component, Type } from "@wonderlandengine/api";

const tempVec = new Float32Array(3);
const tempQuat = new Float32Array(8);

export class PlayerControl extends Component {
    static TypeName = "player-control";
    static Properties = {
        resetButton: { type: Type.Object },
        scoreText: { type: Type.Object },
        highestScoreText: { type: Type.Object },
        leaderBoard: { type: Type.Object },
    };

    start() {
        /* General */
        this.canJump = true;
        this.score = 0;
        this.highestScore = 0;
        window.gameOver = true;

        /* Controllers */
        window.addEventListener("keydown", this.pressStart.bind(this));
        this.engine.onXRSessionStart.add(() => {
            this.engine.xr.session.addEventListener(
                "selectstart",
                this.pressStart.bind(this)
            )
        });

        /* Collision */
        this.object.getComponent("physx").onCollision(this.onCollision.bind(this));

        /* Reset */
        window.addEventListener("reset-game", this.reset.bind(this));
    }

    update(dt) {
        /* Score */
        if (!window.gameOver) {
            this.score += 1 * dt * 13;
            this.scoreText.getComponent("text").text = `Score: ${Math.round(this.score)}`;
        }

        /* Jump */
        if (this.jump == true) {
            tempVec[1] = 5.5 * dt;
            this.object.translateLocal(tempVec); /* Add Z */
            this.object.getTransformWorld(tempQuat);
            if (tempQuat[5] > 1.2) {
                this.jump = false;
                this.canJump = false;
            }
        } else {
            this.object.getTransformWorld(tempQuat);
            if (tempQuat[5] > 0) {
                tempVec[1] = -4.5 * dt;
                this.object.translateLocal(tempVec); /* Subtract Z */
            } else {
                this.canJump = true; /* Landed on Floor */
            }
        }
    }

    pressStart(e) {
        if (!window.gameOver && this.canJump) {
            this.jump = true;
        }
    }

    onCollision(event, other) {
        /* If not collision then don't proceed (To avoid double collision) */
        if (event != WL.CollisionEventType.Touch) {
            return;
        }

        /* Lose */
        this.resetButton
            .getComponent("button")
            .hide(false); /* unhide UI Reset Button */
        window.gameOver = true;

        /* Set Highest Score */
        this.score = Math.round(this.score);
        if (this.highestScore < this.score) {
            this.highestScore = this.score;
            this.highestScoreText.getComponent("text").text = `Highest Score: ${this.score}`;

            /* Submit HighestScore to 'HeyVR.io' Leaderboard */
            if (this.leaderBoard) {
                this.leaderBoard
                    .getComponent("leaderboard-component")
                    .submitScore(this.score);
            }
        }
    }

    reset() {
        this.score = 0;
        this.resetButton.getComponent("button").hide(true);
    }
}
