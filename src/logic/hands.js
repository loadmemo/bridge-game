import {PLAYER_NUM, TOTAL_TRICKS, GAME_STATE} from "../components/constant";
import TrickLogic from "./trick.js";

// this is a class that handle cards in every players hand;
// Whose cards should flip up or down, if they are flip down,
// they should display in unsorted way, otherwise, they should
// display in sorted way.
// for cards flip up, each card should be evaluated if they are allowed a click event
export default class Hands {
  constructor(table, currentUser) {
    this.table = table;
    this.trickModel = new TrickLogic();
    this.firstCard = this.trickModel.getFirstCardOfCurrentTrick(table.game);
    this.declarerIndex = table.game.bid.declarer;
    this.players = table.players;
    this.cards = table.game.cards;
    this.currentUser = currentUser;
    this.isCurrentUserAPlayer = this.isCurrentUserAPlayer();
    this.dummyMode = true;
    this.currentTurnPlayer = this.players[this.table.game.deal];
    this.dummyIndex = (this.table.game.bid.declarer + 2) % PLAYER_NUM;
    this.currentUserIndex = 0;
    this.offsetIndex = this.getOffsetIndex();
    this.offsetCards = this.offsetData().cards;
    this.offsetPlayers = this.offsetData().players;
    this.offsetDummyIndex = this.getIndexInOffsetPlayers(
      this.players[this.dummyIndex]
    );
    this.offsetCurrentUserIndex = this.getIndexInOffsetPlayers(
      this.players[this.currentUser.uid]
    );
    this.all = this.getHands();
  }
  getIndexInOffsetPlayers(player) {
    let index = this.offsetPlayers.findIndex(seat => seat === player);
    return index < 0 ? 0 : index;
  }

  getDisplayHands() {
    // flip cards up or down base on current user, player, and is dummy hand
    return this.getUnplayedCards().map((hand, playerHandIndex) => {
      let flipDownCards = [[], [], [], []];
      hand.map(card => {
        flipDownCards[Math.floor(card.value / TOTAL_TRICKS)].push(card);
      });
      flipDownCards.filter(item => item.length !== 0);

      // flip down cards will be display evently
      if (
        (this.table.gameState === GAME_STATE.auction &&
                    playerHandIndex !== this.currentUserIndex) ||
                (playerHandIndex !== this.currentUserIndex &&
                    playerHandIndex !== this.offsetDummyIndex &&
                    this.isCurrentUserAPlayer)
      ) {
        let mapResult = this.mapFlipDownCards(flipDownCards);
        if (mapResult) {
          flipDownCards = mapResult;
        }
      }

      return flipDownCards;
    });
  }
  // filter all playered cards
  getUnplayedCards() {
    return this.offsetCards.map((hand, index) => {
      if (index === 1 && this.offsetDummyIndex !== 1) {
        hand = hand.sort((a, b) => b.value - a.value);
      } else {
        hand = hand.sort((a, b) => a.value - b.value);
      }
      return hand.filter(card => card.trick === 0);
    });
  }
  // filter empty suits
  getFilteredHands() {
    const hands = this.getDisplayHands();
    return hands.map(hand => hand.filter(suit => suit.length > 0));
  }
  getFlatten(arr) {
    let flatArr = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        flatArr.push(arr[i][j]);
      }
    }
    return flatArr;
  }
  // return all hands with flip up or down state and if they are allow a click event
  getHands() {
    const hands = this.getFilteredHands();
    return hands.map((hand, playerHandIndex) => {
      const hasFollowSameSuit = this.hasSameSuitWithFirstCard(
        this.getFlatten(hand)
        // hand.flat()
      );
      const playerHand = this.offsetPlayers[playerHandIndex];

      return hand.map((each, index) => {
        let dummyPlayer = this.players[this.dummyIndex];
        let declarerPlayer = this.players[this.declarerIndex];
        let isPlayingState =
                    this.table.gameState === GAME_STATE.playing;

        // if player is nither declarer nor dummy plaer
        let canBeClick =
                    isPlayingState &&
                    this.isCurrentUserAPlayer &&
                    // current player is equal to south;
                    this.currentTurnPlayer === playerHand &&
                    playerHandIndex === 0;

        // current turn is dummay hand, and current login user is declare,
        // let current user can control dummy hand's card
        if (
          this.dummyMode &&
                    this.isCurrentUserAPlayer &&
                    dummyPlayer === this.currentTurnPlayer &&
                    isPlayingState
        ) {
          if (
            this.currentUser.uid === declarerPlayer &&
                        playerHandIndex === 2
          ) {
            canBeClick = true;
          }
          if (
            this.currentUser.uid === dummyPlayer &&
                        playerHandIndex === 0
          ) {
            canBeClick = false;
          }
        }

        let flipUp =
                    (isPlayingState ||
                        playerHandIndex === this.currentUserIndex) &&
                    (!this.isCurrentUserAPlayer ||
                        playerHandIndex === this.currentUserIndex ||
                        playerHandIndex === this.offsetDummyIndex);

        let allowClickEvt = card => {
          return (
            this.firstCard === null ||
                        !hasFollowSameSuit ||
                        Math.floor(card.value / TOTAL_TRICKS) ===
                            Math.floor(this.firstCard.value / TOTAL_TRICKS)
          );
        };

        return each.map((cardItem, i) => {
          return Object.assign({}, cardItem, {
            pos: [index, i],
            flipUp: flipUp,
            canBeClick: canBeClick && allowClickEvt(cardItem)
          });
        });
      });
    });
  }
  // current user's offset index from player list in database
  getOffsetIndex() {
    return this.players.findIndex(user => user === this.currentUser.uid);
  }
  isCurrentUserAPlayer() {
    return this.players.includes(this.currentUser.uid);
  }
  // make sure all flip down card will be group into n row base on their card number
  mapFlipDownCards(cards) {
    if (!cards) return;
    let flatArr = this.getFlatten(cards);
    // let flatArr = cards.flat();
    let cardsNumberOnHand = 5;
    let totalLen = flatArr.length;
    // if cards number is under n, split flipdown card into two row;
    if (totalLen <= cardsNumberOnHand) {
      let mid = Math.floor(totalLen / 2);
      return [flatArr.slice(0, mid), flatArr.slice(mid, totalLen)];
    } else {
      let threeRow = [[], [], []];
      flatArr.map((card, index) => threeRow[index % 3].push(card));
      return threeRow;
    }
  }

  hasSameSuitWithFirstCard(cards) {
    return (
      this.firstCard &&
            cards.filter(card => {
              return (
                Math.floor(card.value / TOTAL_TRICKS) ===
                    Math.floor(this.firstCard.value / TOTAL_TRICKS)
              );
            }).length > 0
    );
  }
  offsetData() {
    let cardsByPlayer = this.players
      .map((userIndex, index) => {
        return this.cards.filter(
          (card, i) => i % this.players.length === index
        );
      })
      .slice(0);
    if (this.isCurrentUserAPlayer) {
      return {
        cards: [
          ...cardsByPlayer.slice(this.offsetIndex),
          ...cardsByPlayer.slice(0, this.offsetIndex)
        ],
        players: [
          ...this.players.slice(this.offsetIndex),
          ...this.players.slice(0, this.offsetIndex)
        ]
      };
    }
    return {
      cards: cardsByPlayer,
      players: this.players.slice(0)
    };
  }
}
