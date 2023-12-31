import React from "react";

function CopyIcon({ classes }) {
    return (
        <svg
            width="18"
            height="24"
            viewBox="0 0 18 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={classes}
        >
            <path
                d="M6.26 2.22241C6.26 1.44509 6.89016 0.814941 7.6675 0.814941H10.4825C11.2598 0.814941 11.89 1.44509 11.89 2.22241C11.89 2.99973 11.2598 3.62988 10.4825 3.62988H7.6675C6.89016 3.62988 6.26 2.99973 6.26 2.22241Z"
                fill="inherit"
            />
            <path
                d="M3.445 2.22241C1.89032 2.22241 0.630005 3.4827 0.630005 5.03735V20.5195C0.630005 22.0742 1.89032 23.3344 3.445 23.3344H14.705C16.2597 23.3344 17.52 22.0742 17.52 20.5195V5.03735C17.52 3.4827 16.2597 2.22241 14.705 2.22241C14.705 4.55438 12.8145 6.44482 10.4825 6.44482H7.6675C5.33548 6.44482 3.445 4.55438 3.445 2.22241Z"
                fill="inherit"
            />
        </svg>
    );
}

export default CopyIcon;
