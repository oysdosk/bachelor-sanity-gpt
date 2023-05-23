import React from 'react';
import BeatLoader from "react-spinners/BeatLoader";

const override = `
  display: block;
  margin: 0 auto;
  border-color: red;
`;

function Spinner() {
  return (
    <div className="sweet-loading" style={{ margin: 40 }}>
      <BeatLoader color={"#123abc"} css={override} size={15} margin={4} />
    </div>
  );
}

export default Spinner;