import React from "react";
import Game from "./game.js";
import {Redirect} from "react-router-dom";
import {dispatch, dispatchToDatabase} from "../reducer/reducer.js";
import Sidebar from "./sidebar/sidebar.js";
import {GAME_STATE} from "./constant.js";
import {app} from "../firebase/firebase.js";
import randomColor from "randomcolor";
import {EMPTY_SEAT} from "./constant.js";
import Header from "./header.js";
import Loading from "./loading.js";
import "../style/table.scss";
import "../style/sidebar.scss";
import "../style/record-item.scss";
import "../style/record.scss";
import "../style/dot.scss";
import "../style/rewind.scss";

export default class Table extends React.Component {
  constructor(props) {
    super(props);
    this.updateTableData = this.updateTableData.bind(this);
    this.linkId =
            this.props.match.params.id || window.location.hash.slice(8);
    if (!this.props.currentUser) {
      this.props
        .getUserAuthInfo()
        .then(user => {
          app.getDataByPathOnce(
            `tableList/${this.linkId}`,
            snapshot => {
              if (!snapshot.val()) {
                return null;
              }
              let tableKey = snapshot.val().id;
              dispatchToDatabase("UPDATE_TABLE_TIMESTAMP", {
                id: tableKey
              });
              app.getDataByPathOnce(
                `tables/${tableKey}/`,
                snapshot => {
                  this.updateTableData(tableKey, this.linkId)
                    .then(msg =>
                      this.setState({isLoad: true})
                    )
                    .catch(err => console.log(err));
                }
              );
            }
          );
        })
        .catch(err => this.setState({redirectToLogin: true}));
    } else {
      this.linkId = this.props.match.params.id;
      this.tableKey = this.props.tableList[this.linkId].id;
      this.updateTableData()
        .then(msg => this.setState({isLoad: true}))
        .catch(err => console.log(err));
    }

    this.state = {
      isLoad: false,
      redirectToLogin: false
    };

    // only fetch data

    this.addPlayerToTable = this.addPlayerToTable.bind(this);
    this.color = randomColor("dark");
  }

  closeTable(tableKey = this.tableKey, linkId = this.linkId) {
    return new Promise((resolve, reject) => {
      app.setNodeByPath(
        `tables/${tableKey}/gameState/${GAME_STATE.gameover}`,
        GAME_STATE.gameover
      );
    });
  }

  updateTableData(tableKey = this.tableKey, linkId = this.linkId) {
    return new Promise((resolve, reject) => {
      app.getNodeByPath(`tables/${tableKey}`, value => {
        resolve(value.val());
        return dispatch("UPDATE_TABLE_DATA", {
          table: value.val(),
          id: tableKey
        });
      });
      app.getNodeByPath(`chatroom/${tableKey}`, value => {
        resolve("successfulyy");
        return dispatch("UPDATE_CHAT_ROOM", {
          chatroom: value.val()
        });
      });
    });
  }
  componentDidMount() {
    // fetch data again
    this.updateTableData().then(data => this.setState({isLoad: true}));
  }
  addPlayerToTable(table) {
    if (!table) return;
    let {players, viewers} = table;
    let emptySeatIndex = players.findIndex(seat => seat === EMPTY_SEAT);
    let alreadyAPlayer = players.some(
      seat => seat === this.props.currentUser.uid
    );
    let alreadyAViewer = Boolean(
      viewers && viewers[this.props.currentUser.uid]
    );
    if (emptySeatIndex > -1 && !alreadyAPlayer) {
      dispatchToDatabase("ADD_PLAYER_TO_TABLE", {
        currentUser: this.props.currentUser,
        table: table,
        emptySeatIndex: emptySeatIndex,
        color: this.color
      });
    } else if (!alreadyAViewer) {
      dispatchToDatabase("ADD_VIEWER_TO_TABLE", {
        currentUser: this.props.currentUser,
        table: table,
        color: this.color
      });
    }
  }
  componentDidUpdate(prevProps) {
    // if this is a different table
    if (!this.props.tableList) return;
    if (this.props.currentTableId !== prevProps.currentTableId) {
      this.setState({isLoad: false});
      this.updateTableData().then(data => this.setState({isLoad: true}));
    }

    let {tableKey, linkId} = this;
    if (this.props.tableList[this.linkId].id) {
      if (this.props.tables[tableKey] !== prevProps.tables[tableKey]) {
        this.addPlayerToTable(this.props.tables[tableKey]);
      }
    }
  }
  render() {
    if (this.state.redirectToLogin) {
      return <Redirect to="/login" />;
    }

    if (!this.state.isLoad) {
      return <Loading />;
    }

    let {tables, currentUser} = this.props;
    let linkId = this.props.match.params.id;
    let tableKey = this.props.tableList[linkId].id;
    if (!tables || !tables[tableKey]) {
      return null;
    }
    let targetTable = tables[tableKey];
    if (
      targetTable.gameState &&
            targetTable.gameState === GAME_STATE.close
    ) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <Header
          roomNum={this.linkId || null}
          isTableColor={true}
          getUserAuthInfo={this.props.getUserAuthInfo}
          currentUser={this.props.currentUser}
        />
        <div className="table">
          <Game
            currentUser={currentUser}
            currentTableId={this.props.currentTableId}
            table={targetTable}
          />
          <Sidebar
            currentUser={currentUser}
            chatroom={this.props.chatroom}
            table={targetTable}
          />
        </div>
      </div>
    );
  }
}
