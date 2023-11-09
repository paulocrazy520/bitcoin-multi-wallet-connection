import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import CheckIcon from "../assets/icons/CheckIcon";
import CloseIcon from "../assets/icons/CloseIcon";
import CancelIcon from "../assets/icons/CancelIcon";
import WarningIcon from "../assets/icons/WarningIcon";

export function SuccessMessage({ msg = '', closeToast, timeout = 3 }) {
    useEffect(() => {
        setTimeout(() => {
            closeToast();
        }, timeout * 1000);
    })
    return (
        <MessageContainer type="success">
            <div className="msg__icon">
                <CheckIcon />
            </div>
            <div className="msg__text">{msg}</div>
            <button className="msg__icon-close" onClick={closeToast}>
                <CloseIcon />
            </button>
        </MessageContainer>
    );
}

export function WarningMessage({ msg = '', closeToast, timeout = 3 }) {
    useEffect(() => {
        setTimeout(() => {
            closeToast();
        }, timeout * 1000);
    })
    return (
        <MessageContainer type="warning">
            <div className="msg__icon">
                <WarningIcon />
            </div>
            <div className="msg__text">{msg}</div>
            <button className="msg__icon-close" onClick={closeToast}>
                <CloseIcon />
            </button>
        </MessageContainer>
    );
}

export function FailedMessage({ msg = '', closeToast, timeout = 3 }) {
    useEffect(() => {
        setTimeout(() => {
            closeToast();
        }, timeout * 1000);
    })
    return (
        <MessageContainer type="failed">
            <div className="msg__icon">
                <CancelIcon />
            </div>
            <div className="msg__text">{msg}</div>
            <button className="msg__icon-close" onClick={closeToast}>
                <CloseIcon />
            </button>
        </MessageContainer>
    );
}

function MessageContainer({ children, type = "success" }) {
    return <div className={`msg__container ${type}`}> {children}</div>;
}
