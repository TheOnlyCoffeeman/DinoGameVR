import { Component, Type } from "@wonderlandengine/api";

let leaderboardService;

export class LeaderboardComponent extends Component {
  static TypeName = "leaderboard-component";
  static Properties = {
    amountScoresDisplayed: { type: Type.Int, default: 10 },
    lastScoreDisplay: { type: Type.Object },
    modeToggleButton: { type: Type.Object },
    textColumn1: { type: Type.Object },
    textColumn2: { type: Type.Object },
    textColumn3: { type: Type.Object },
  };

  init() {
    this.debug = false; /* Set to true if you want to Debug */
    this.loaded = false;
    this.baseLeaderboardId =
      "dino-game-vr"; /* Your Game Leaderboard ID (Contact HeyVR.io to get it) */
    this.scoreStorageMultiplicator = 1.0;
    this.title = this.object.getComponent("text");
    this.firstColumn =
      this.textColumn1.getComponent("text"); /* Numbers Column */
    this.secondColumn =
      this.textColumn2.getComponent("text"); /* Players' Names Column */
    this.thirdColumn =
      this.textColumn3.getComponent("text"); /* Player's Scores Column */
    if (this.lastScoreDisplay)
      this.lastScoreDisplayText = this.lastScoreDisplay.getComponent("text");

    this.worldModeChar = "ƙ";
    this.playerModeChar = "Ƙ";

    this.currentMode = "world";

    this.leaderboards = {
      world: null,
      player: null,
    };

    if ("casdk" in window || this.debug) {
      if (!this.loaded) {
        this.loaded = true;
        this.getLeaderboard();
      }
    }

    leaderboardService = this;
    this.selectSound = this.modeToggleButton.getComponent(
      "howler-audio-source"
    );
    this.modeToggleButtonText =
      this.modeToggleButton.children[0].getComponent("text");
  }

  start() {
    this.modeToggleButton
      .getComponent("cursor-target")
      .addClickFunction(this.toggleMode.bind(this));
  }

  toggleMode() {
    this.currentMode = this.currentMode == "world" ? "player" : "world";
    this.modeToggleButtonText.text =
      this.currentMode == "world" ? this.worldModeChar : this.playerModeChar;
    this.displayLeaderboard = this.currentMode;
    this.getLeaderboard(false, this.currentMode);
  }

  submitScore(score) {
    /* Call this function from your game, passing in it the player's score */
    /* Math.round seems necessary to guarantee integral value */
    let submissionScore = Math.round(score * this.scoreStorageMultiplicator);

    this.leaderboards.world = null;
    this.leaderboards.player = null;

    if (this.lastScoreDisplayText) {
      this.lastScoreDisplayText.text = `Last Score
${submissionScore}`;
      this.lastScoreDisplayText.active = true;
    }
    if ("casdk" in window) {
      return casdk.submitScore(this.baseLeaderboardId, submissionScore).then(
        function () {
          setTimeout(
            function () {
              this.getLeaderboard(true);
            }.bind(this),
            400
          );
        }.bind(this)
      );
    } else if (this.debug) {
      this.firstColumn.text = "";
      this.secondColumn.text = "Loading...";
      this.thirdColumn.text = "";
      setTimeout(this.getLeaderboard.bind(this), 2000);
    }
  }

  /**
   * @summary Request an update of the leaderboard entries.
   *
   * This is already done after @ref submitScore()
   */
  getLeaderboard(forceGet, mode) {
    forceGet = forceGet || false;
    mode = mode || this.currentMode;
    this.displayLeaderboard = mode;
    if (!("casdk" in window)) {
      if (this.debug) {
        /* Simulate a delayed request return (if this.debug = true) */
        setTimeout(
          function () {
            const s = this.scoreStorageMultiplicator;
            this.onScoresRetrieved([
              { rank: 0, displayName: "User", score: 100000 * s },
              { rank: 1, displayName: "Player", score: 78 * s },
              { rank: 2, displayName: "Bot", score: 34 * s },
              { rank: 3, displayName: "Debugger", score: 12 * s },
              { rank: 4, displayName: "Test", score: 2 * s },
              { rank: 5, displayName: "Test", score: 2 * s },
              { rank: 6, displayName: "Test", score: 2 * s },
              { rank: 7, displayName: "Test", score: 2 * s },
              { rank: 8, displayName: "Test", score: 2 * s },
              { rank: 9, displayName: "Test", score: 2 * s },
            ]);
          }.bind(this),
          1000
        );
      }
      return;
    }

    if (this.leaderboards[mode] && !forceGet) {
      this.onScoresRetrieved(this.leaderboards[mode]);
      return;
    }

    this.title.text = mode == "world" ? "Global" : "Player";
    this.firstColumn.text = "";
    this.secondColumn.text = "Loading...";
    this.thirdColumn.text = "";

    casdk
      .getLeaderboard(this.baseLeaderboardId, true, mode != "world", 10)
      .then(
        function (r) {
          this.leaderboards[mode] = r.leaderboard;
          if (this.leaderboards[this.displayLeaderboard])
            this.onScoresRetrieved(this.leaderboards[this.displayLeaderboard]);
        }.bind(this)
      );
  }

  onScoresRetrieved(scores) {
    if (scores == null) {
      console.warn("Retrieving scores failed.");
      return;
    }
    let leftText = "\n";
    let centerText = "\n";
    let rightText = "\n";

    for (
      let i = 0;
      i < Math.min(this.amountScoresDisplayed, scores.length);
      i++
    ) {
      const rank = scores[i].rank + 1 + "\n";
      const name = (scores[i].displayName || "unknown") + "\n";
      const score = scores[i].score / this.scoreStorageMultiplicator + "\n";

      leftText += rank;
      centerText += name;
      rightText += score;
    }

    this.title.text = this.currentMode == "world" ? "Global" : "Player";
    this.firstColumn.text = leftText;
    this.secondColumn.text = centerText;
    this.thirdColumn.text = rightText;
  }
}
