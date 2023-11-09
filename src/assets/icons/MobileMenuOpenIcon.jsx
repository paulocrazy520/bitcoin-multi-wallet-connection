import React from "react";
import SVGIconWrapper from "./SVGIconWrapper";

function MobileMenuOpenIcon(props) {
    return (
        <SVGIconWrapper {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 3.5C0 1.84315 1.34315 0.5 3 0.5H39C40.6569 0.5 42 1.84315 42 3.5C42 5.15685 40.6569 6.5 39 6.5H3C1.34315 6.5 0 5.15685 0 3.5Z"
                fill="inherit"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 18.5C0 16.8431 1.34315 15.5 3 15.5H39C40.6569 15.5 42 16.8431 42 18.5C42 20.1569 40.6569 21.5 39 21.5H3C1.34315 21.5 0 20.1569 0 18.5Z"
                fill="inherit"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18 33.5C18 31.8431 19.3431 30.5 21 30.5H39C40.6569 30.5 42 31.8431 42 33.5C42 35.1569 40.6569 36.5 39 36.5H21C19.3431 36.5 18 35.1569 18 33.5Z"
                fill="inherit"
            />
        </SVGIconWrapper>
    );
}

export default MobileMenuOpenIcon;
