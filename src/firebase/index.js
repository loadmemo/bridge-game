import firebase from "firebase";
import {config} from "./config.js";

export const firebaseApp = firebase.initializeApp(config);

const Database = {
  auth: firebaseApp.auth(),
  onAuthChanged: callback => {
    firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        callback(user);
      } else {
        console.log("no one login");
      }
    });
  },
  getNodeByPathOnce: (path, action) => {
    return firebaseApp
      .database()
      .ref(path)
      .once("value", action);
  },
  getNodeByPath: (path, action) => {
    return firebaseApp
      .database()
      .ref(path)
      .on("value", action);
  },
  pushDataByPath: (path, data) => {
    return firebaseApp
      .database()
      .ref(path)
      .push(data);
  },
  cancelListenDataChange: (path, action) => {
    return firebaseApp
      .database()
      .ref(path)
      .off("value", action);
  },
  listenPathChildren: (path, action) => {
    return firebaseApp
      .database()
      .ref(path)
      .off("value");
  },
  setNodeByPath: (path, data) => {
    return firebaseApp
      .database()
      .ref(path)
      .set(data);
  },
  getDataByPathOnce: (path, action) => {
    return firebaseApp
      .database()
      .ref(path)
      .once("value", action);
  },
  getNewChildKey: node => {
    return firebaseApp
      .database()
      .ref()
      .child(node)
      .push().key;
  },
  updateTableDataByID: (id, data) => {
    firebaseApp
      .database()
      .ref(`tables/${id}/`)
      .set(data);
  },
  updateTableGameDataByPath: (path, game) => {
    firebaseApp
      .database()
      .ref("tables/" + path)
      .set(game);
  },
  setTableListData: (id, data) => {
    firebaseApp
      .database()
      .ref(`tableList/${id}/`)
      .set(data);
  },
  getChatRoomById: id => {
    return new Promise((resolve, reject) => {
      Database.getNodeByPath(`chatroom/${id}/`, snapshot =>
        resolve(snapshot.val())
      );
    });
  },
  getTableByLinkId: linkId => {
    return new Promise((resolve, reject) => {
      Database.getNodeByPath(`tableList/${linkId}`, snapshot => {
        if (snapshot.val()) {
          return Database.getNodeByPath(
            `tables/${snapshot.val().id}/`,
            snapshot => resolve(snapshot.val())
          );
        } else {
          throw new Error("NO TABLE DATA IN Database");
        }
      });
    }).catch(error => console.log(error.message));
  },
  signInWithEmailAndPassword: info => {
    let {email, password} = info;
    return firebaseApp.auth().signInWithEmailAndPassword(email, password);
  },
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      Database.auth.onAuthStateChanged(user => {
        if (user) {
          Database.getDataByPathOnce(`users/${user.uid}`, snapshot => {
            resolve({user: user, userInfo: snapshot.val()});
          });
        } else {
          reject(null);
        }
      });
    });
  }
};

export default Database;