import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Auction from "./auction.js";

export default class AuctionState extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className="auction">
          <Auction
            table={this.props.table}
            currentUser={this.props.currentUser}
          />
        </div>
      </div>
    );
  }
}
