import React from "react";
import SVGIconWrapper from "./SVGIconWrapper";

function MobileMenuCloseIcon(props) {
    return (
        <SVGIconWrapper {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.87868 1.37868C2.05025 0.207107 3.94975 0.207107 5.12132 1.37868L18 14.2574L30.8787 1.37868C32.0503 0.207107 33.9497 0.207107 35.1213 1.37868C36.2929 2.55025 36.2929 4.44975 35.1213 5.62132L22.2426 18.5L35.1213 31.3787C36.2929 32.5503 36.2929 34.4497 35.1213 35.6213C33.9497 36.7929 32.0503 36.7929 30.8787 35.6213L18 22.7426L5.12132 35.6213C3.94975 36.7929 2.05025 36.7929 0.87868 35.6213C-0.292893 34.4497 -0.292893 32.5503 0.87868 31.3787L13.7574 18.5L0.87868 5.62132C-0.292893 4.44975 -0.292893 2.55025 0.87868 1.37868Z"
                fill="inheirt"
            />
        </SVGIconWrapper>
    );
}

export default MobileMenuCloseIcon;
