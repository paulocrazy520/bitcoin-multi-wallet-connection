import React from "react";

function SVGIconWrapper({ styes = {}, classes = "", viewBox = "", children }) {
    return (
        <svg
            viewBox={viewBox}
            fill="inherit"
            xmlns="http://www.w3.org/2000/svg"
            className={classes}
            style={styes}
        >
            {children}
        </svg>
    );
}

export default SVGIconWrapper;
