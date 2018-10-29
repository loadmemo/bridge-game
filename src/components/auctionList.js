import React from "react";
import PropTypes from "prop-types";
import {SUIT_SHAPE} from "./constant.js";

export const AuctionList = ({result, scale}) => {
  if (!result) {
    return null;
  }
  let resultsNum = result.length;
  return (
    <div className="record">
      {Array.from({length: Math.ceil(resultsNum / 4)})
        .fill(0)
        .map((res, index) => (
          <div key={`result-item-${index}`} className="row">
            {Array.from({length: 4})
              .fill(0)
              .map((re, j) => {
                let resultItem = result[index * 4 + j];
                if (resultItem && resultItem.opt) {
                  return (
                    <div
                      key={`result-item-opt-${j}`}
                      className="bid-result">
                      {resultItem.opt}
                    </div>
                  );
                } else if (
                  resultItem &&
                                    resultItem.trick >= 0
                ) {
                  return (
                    <div
                      key={`result-item-opt-${j}`}
                      className="bid-result">
                      <div>{resultItem.trick + 1}</div>
                      {SUIT_SHAPE[resultItem.trump](
                        scale
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`result-item-opt-${j}`}
                      className="bid-result">
                      {null}
                    </div>
                  );
                }
              })}
          </div>
        ))}
    </div>
  );
};
