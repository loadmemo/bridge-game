import React from "react";
import PropTypes from "prop-types";
import TrickScore from "./trickScore.js";
import {dispatchToDatabase} from "../reducer/reducer.js";
import {RESULT} from "./constant.js";
import "../style/btn.scss";

export default class ScoreBoard extends React.Component {
  constructor(props) {
    super(props);
    this.recordGame = this.recordGame.bind(this);
  }
  recordGame() {
    let {table} = this.props;
    let {game} = table;
    if (!table || game.order !== 51) {
      return;
    }
    dispatchToDatabase("CREATE_NEW_GAME", {
      table: table
    });
  }
  render() {
    let {windowWidth, table, windowHeight, currentUser} = this.props;
    let {game, players} = this.props.table;
    if (!game || !game.cards) {
      return null;
    }
    let playerIndex = players.indexOf(currentUser.uid);
    let playerTeamScore = 0,
      opponentScore = 0;
    game.cards.map((card, index) => {
      let winScore = card.isWin ? 1 : 0;
      if (card.player % 2 === playerIndex % 2) {
        playerTeamScore += winScore;
      } else {
        opponentScore += winScore;
      }
    });

    let resultWords = null;
    let {declarer, trick} = game.bid;

    // trick start from 0, 0 means one trick... 
    let targetTrick = 6 + (trick + 1);
    let isPlayerInDeclarerTeam = playerIndex % 2 === declarer % 2;
    let isCurrentUserAPlayer = playerIndex >= 0;
    let isUserWin = false;

    if (isPlayerInDeclarerTeam && playerTeamScore >= targetTrick) {
      resultWords = RESULT.win;
      isUserWin = true;
    } else if (isCurrentUserAPlayer) {
      resultWords = RESULT.lose;
    } else {
      resultWords = "";
    }

    let resultAction = isCurrentUserAPlayer ? (
      <button onClick={this.recordGame} className="btn">
                再來一局
      </button>
    ) : (
      "比賽結束"
    );

    return (
      <div
        className={
          isUserWin ? "game-over-board win" : "game-over-board lose"
        }>
        <TrickScore
          currentUser={this.props.currentUser}
          ratio={0.5}
          thumbnailSize={46}
          windowWidth={this.props.windowWidth}
          widnowHeight={this.props.windowHeight}
          table={this.props.table}>
          <div className="game-over-board-inner">
            <div className="result">
              <div className="words">{resultWords}</div>
            </div>
            <div className="btn-wrapper">{resultAction}</div>
          </div>
        </TrickScore>
      </div>
    );
  }
}
