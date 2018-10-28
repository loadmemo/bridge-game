import React from "react";
import PropTypes from "prop-types";
import {CARD_NUM, CARD_RANK, SUIT_SHAPE, TOTAL_TRICKS} from "./constant.js";
import "../style/reset.scss";
import "../style/card.scss";

export const TrickCard = ({value}) => {
  return (
    <div>
      <Card flipUp={true} value={value} />
    </div>
  );
};

export const Card = ({value, evt = null, flipUp, name = null}) => {
  let kind = Math.floor(value / TOTAL_TRICKS);
  let wrapperName = name ? `card-wrapper ${name}` : "card-wrapper";
  if (flipUp) {
    return (
      <div
        className={wrapperName}
        onClick={() => {
          if (evt) {
            evt(value);
          }
        }}>
        <div className="card flip-up">
          <div className="card-inner">
            <div
              className={
                kind === 1 || kind === 2
                  ? "red value"
                  : "black value"
              }>
              {CARD_RANK[value % TOTAL_TRICKS]}
            </div>
            {SUIT_SHAPE[kind](0.235)}
            <div className="large-shape">
              {SUIT_SHAPE[kind](0.5)}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={wrapperName}>
        <div className="card flip-down">
          <div className="card-inner" />
        </div>
      </div>
    );
  }
};
