import React, { createContext, useContext, useEffect, useReducer, useState, useRef } from "react";
import { toast } from "react-toastify";
import { FailedMessage, SuccessMessage, WarningMessage } from "../components/Notifications";

export default function useToast() {
  const toastRef = useRef();

  const handleToastClose = () => {
    toast.dismiss(toastRef.current);
  };

  const notifySuccess = (msg = '', timeout = 3) => {
    (toastRef.current = toast(
      <SuccessMessage
        msg={msg}
        closeToast={handleToastClose}
        timeout={timeout}
      />
    ));
    return handleToastClose;
  }

  const notifyWarning = (msg = '', timeout = 3) => {
    (toastRef.current = toast(
      <WarningMessage
        msg={msg}
        closeToast={handleToastClose}
        timeout={timeout}
      />
    ));
    return handleToastClose
  }

  const notifyFailed = (msg = '', timeout = 3) => {
    return (toastRef.current = toast(
      <FailedMessage
        msg={msg}
        closeToast={handleToastClose}
        timeout={timeout}
      />
    ));
  }

  return {
    messageApi: {
      notifySuccess,
      notifyFailed,
      notifyWarning
    }
  }

}