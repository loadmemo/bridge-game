import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {Thumbnail} from "./thumbnail.js";
import {app} from "../firebase/firebase.js";
import {Link} from "react-router-dom";
import "../style/user-state.scss";

export default class UserState extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.handleSignOut = this.handleSignOut.bind(this);
    this.closePanel = this.closePanel.bind(this);
  }
  handleSignOut() {
    this.closePanel();
    app.auth.signOut();
  }
  closePanel() {
    this.setState({isOpen: false});
  }
  render() {
    return (
      <div className="user-state-panel">
        <div
          className={
            this.state.isOpen
              ? "Login-state-btn open-btn"
              : "Login-state-btn"
          }
          onClick={() => this.setState({isOpen: !this.state.isOpen})}>
          <Thumbnail
            size={40}
            name={this.props.currentUser.displayName}
          />
          <div>
            <h6>{this.props.currentUser.displayName}</h6>
            <span>online</span>
          </div>
        </div>
        <div className={this.state.isOpen ? "options open" : "options"}>
          <a>Rank</a>
          <a>Win Rate</a>
          <a>Profile</a>
          <Link onClick={this.handleSignOut} to="/">
                        Sign out
          </Link>
        </div>
      </div>
    );
  }
}