import React from "react";
import PropTypes from "prop-types";
import {Redirect} from "react-router-dom";
import {dispatch, dispatchToDatabase} from "../reducer";
import Sidebar from "./sidebar";
import {GAME_STATE, EMPTY_SEAT} from "./constant";
import Database from "../firebase";
import CurrentUserFetcher from "../logic/currentUserFetcher.js";
import randomColor from "randomcolor";
import TableModel from "../reducer/tableModel.js";
import Header from "./header";
import Loading from "./common/loading.js";
import {FloatBtn} from "./common/floatBtn.js";
import GameState from "./gameState.js";
import "../style/reset.scss";
import "../style/table.scss";
import "../style/game.scss";
import "../style/record-item.scss";
import "../style/record.scss";
import "../style/dot.scss";
import "../style/rewind.scss";
import "../style/sidebar.scss";

/*
 * Page component that display all elements needed in table page
 */
export default class Table extends React.Component {
  constructor(props) {
    super(props);
    // get table link id from url
    this.linkId =
            this.props.match.params.id || window.location.hash.slice(8);

    // create a tmp ref for sidebar component
    this.childRef = React.createRef();

    this.state = {
      isLoad: false,
      canRedirect: false,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      sidebarWidth: null,
      isClosed: false
    };

    this.addPlayerToTable = this.addPlayerToTable.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.color = randomColor("dark");
  }

  handleResize() {
    setTimeout(() => {
      let width = 0;
      if (this.childRef.current) {
        width = this.childRef.current.offsetWidth;
      }
      if (this.props.isSidebarPanelShown && window.innerWidth <= 700) {
        this.toggleChatroom();
      }
      this.setState({sidebarWidth: width});
    }, 0);

    this.setState({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  componentDidMount() {
    // register database event and fetch table data
    this.model = new TableModel(this.linkId);
    let currentUser = this.props.currentUser;
    this.userObj = new CurrentUserFetcher(this.props.currentUser);
    this.userObj.loadUser();
    this.model
      .get()
      .then(table => {
        this.id = table.id;
        this.setState({isLoad: true});
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        if (
          this.props.currentUser &&
                    !table.players.includes(currentUser.uid)
        ) {
          this.addPlayerToTable(table);
        }
      })
      .catch(error => {
        if (error === null) {
          this.setState({isClosed: true});
        }
      });
  }
  // when a player enter to current table page, add them as a player or a viewer
  addPlayerToTable(table) {
    let {players, viewers} = table;
    let {currentUser} = this.props;

    let emptySeatIndex = players.findIndex(seat => seat === EMPTY_SEAT),
      canBePlayer =
                players.some(seat => seat === EMPTY_SEAT) &&
                players.every(seat => seat !== currentUser.uid),
      canBeViewer = Boolean(!viewers || !viewers[currentUser.uid]);

    if (canBePlayer) {
      dispatchToDatabase("ADD_PLAYER_TO_TABLE", {
        currentUser: currentUser,
        table: table,
        emptySeatIndex: emptySeatIndex,
        color: this.color
      });
    } else if (canBeViewer) {
      dispatchToDatabase("ADD_VIEWER_TO_TABLE", {
        currentUser: currentUser,
        table: table,
        color: this.color
      });
    }
  }
  toggleSidebar() {
    dispatch("TOGGLE_SIDEBAR_PANEL", {
      isSidebarPanelShown: !this.props.isSidebarPanelShown
    });
    this.handleResize();
  }
  componentDidUpdate(prevProps) {
    let {tableList, tables, currentTableId} = this.props;
    if (!tableList) return;

    if (currentTableId !== prevProps.currentTableId) {
      this.setState({isLoad: false});
      this.model
        .get()
        .then(data => this.setState({isLoad: true}))
        .catch(error => this.setState({isClosed: true}));
    }

    let {id, linkId} = this;

    if (tableList[linkId] && tableList[linkId].id) {
      if (tables[id] !== prevProps.tables[id]) {
        this.addPlayerToTable(tables[id]);
      }
    }
  }
  render() {
    let {canRedirect, isLoad} = this.state;

    if (this.state.isClosed) {
      alert("table is closed");
      return <Redirect to="/" />;
    }
    if (canRedirect) {
      return <Redirect to="/login" />;
    }

    if (!isLoad) {
      return <Loading />;
    }

    let {tables, currentUser, chatroom} = this.props;

    let {id} = this;

    if (!tables || !id) {
      return null;
    }

    let targetTable = tables[id];

    if (
      targetTable.gameState &&
            targetTable.gameState === GAME_STATE.close
    ) {
      return <Redirect to="/" />;
    }

    let sidebarPanelToggleBtn = this.props.isHeaderPanelClosed &&
            !this.props.isSidebarPanelShown && (
      <FloatBtn clickEvt={this.toggleSidebar} />
    );

    return (
      <div>
        <Header
          isHeaderPanelClosed={this.props.isHeaderPanelClosed}
          roomNum={this.linkId || null}
          isTableColor={true}
          currentUser={currentUser}
        />
        <div className="table">
          <GameState
            windowWidth={this.state.windowWidth}
            windowHeight={this.state.windowHeight}
            sidebarWidth={this.state.sidebarWidth}
            sidebarRef={this.childRef}
            isSidebarPanelShown={this.props.isSidebarPanelShown}
            currentUser={currentUser}
            currentTableId={this.props.currentTableId}
            table={targetTable}
          />
          <Sidebar
            setRef={this.childRef}
            toggleSidebar={this.toggleSidebar}
            isSidebarPanelShown={this.props.isSidebarPanelShown}
            currentUser={currentUser}
            chatroom={chatroom}
            table={targetTable}
          />
          {sidebarPanelToggleBtn}
        </div>
      </div>
    );
  }
}

Table.propTypes = {
  table: PropTypes.object,
  isSidebarPanelShown: PropTypes.bool,
  windowWidth: PropTypes.number,
  windowHeight: PropTypes.number,
  sidebarWidth: PropTypes.number,
  sidebarRef: PropTypes.object,
  currentUser: PropTypes.object,
  currentTableId: PropTypes.any,
  match: PropTypes.object
};
