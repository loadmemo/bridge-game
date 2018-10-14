import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {Link, Redirect} from "react-router-dom";
import {getRandomKey} from "../helper/helper.js";
import {dispatch, dispatchToDatabase} from "../reducer/reducer.js";
import {EMPTY_SEAT} from "../components/constant.js";
import {getObj, getObjSortKey} from "../helper/helper.js";
import {app} from "../firebase/firebase.js";
import "../style/table-list.scss";

export default class OpenTables extends React.Component {
  constructor(props) {
    super(props);
    this.createTable = this.createTable.bind(this);
    this.updateHeader = this.updateHeader.bind(this);
  }
  createTable(tableRef) {
    if (!this.props.currentUser) {
      return;
    }
    dispatchToDatabase("CREATE_TABLE", {
      tableRef: tableRef,
      currentUser: this.props.currentUser
    });
    this.updateHeader();
  }
  updateHeader() {
    let val = true;
    if (!this.props.currentUser) {
      val = false;
    }
    dispatch("SET_CURRENT_HEADER", {isInTablePage: val});
  }
  render() {
    let tableList = this.props.tableList;
    let tableLinks;
    if (tableList) {
      let tableListKey = Object.keys(tableList);
      let filteredList = tableListKey.filter(
        key =>
          tableList[key].players
            ? tableList[key].players.some(
              seat => seat === EMPTY_SEAT
            )
            : !tableList[key].players
      );

      tableLinks = filteredList.map((key, index) => {
        let players = this.props.tableList[key].players;
        let emptySeats = players
          ? players.filter(player => player === EMPTY_SEAT).length
          : 4;

        // should have owner
        let owner = "";

        return (
          <div
            className="table-list-item"
            key={`tablelist-item-${index}}`}>
            <div>{index + 1}</div>
            <div>{owner}</div>
            <div className="empty-seats">{emptySeats} </div>
            <div>
              <Link
                className="btn-style-border"
                onClick={this.updateHeader}
                key={key}
                to={
                  this.props.currentUser
                    ? `/table/${key}`
                    : "/login"
                }>
                                Play
              </Link>
            </div>
          </div>
        );
      });
      // onClick={() => this.addPlayerToTable(key)}
    }

    let tableRef = new Date().getTime();
    let openBtn = this.props.openBtn && (
      <Link
        className="btn-style-border"
        onClick={() => this.createTable(tableRef)}
        to={this.props.currentUser ? `/table/${tableRef}` : "/login"}>
                Open table
      </Link>
    );

    return (
      <div className="table-list">
        {this.props.title && <h4>{this.props.title}</h4>}
        <div className="table-list-header">
          <div>No.</div>
          <div>Owner</div>
          <div>Available seat</div>
          <div className="open-table-section">{openBtn}</div>
        </div>
        <div className="table-list-item-group">{tableLinks}</div>
      </div>
    );
  }
}

// {!this.props.isLoad && (
//   <div className="loading-table-list">
//     <div className="table-list-item-group">loading... </div>
//   </div>
// )}

// <div className="btn-group">
// <button className="btn-style">Match me</button>
// </div>