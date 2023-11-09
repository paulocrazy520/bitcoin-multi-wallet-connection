import React, { createContext, useContext, useReducer } from "react";

const modalActions = {
    OPEN_MODAL: "OPEN_MODAL",
    CLOSE_MODAL: "CLOSE_MODAL",
    TOGGLE_MODAL: "CLOSE_MODAL",
    ADD_MODAL: "ADD_MODAL",
    REMOVE_MODAL: "REMOVE_MODAL",
};

const initialState = {
    open: false,
    addModalContainer: false,
};

const reducer = (state, { type }) => {
    switch (type) {
        case modalActions.OPEN_MODAL: {
            return {
                ...state,
                open: true,
            };
        }
        case modalActions.CLOSE_MODAL: {
            return {
                ...state,
                open: false,
            };
        }
        case modalActions.TOGGLE_MODAL: {
            return {
                ...state,
                open: !state.open,
            };
        }

        case modalActions.ADD_MODAL: {
            return {
                ...state,
                addModalContainer: true,
            };
        }

        case modalActions.REMOVE_MODAL: {
            return {
                ...state,
                addModalContainer: false,
            };
        }

        default:
            return state;
    }
};

export const ModalContext = createContext({
    modalState: initialState,
    modalDispatch: () => { },
    openModal: () => { },
    closelModal: () => { },
    toggleModal: () => { },
    addModal: () => { },
    removeModal: () => { },
});

export function ModalStateProvider({ children }) {
    const [modalState, modalDispatch] = useReducer(reducer, initialState);

    let timer = 250;

    function openModal() {
        addModal();

        setTimeout(() => {
            modalDispatch({ type: modalActions.OPEN_MODAL });
        }, 150);
    }

    function addModal() {
        modalDispatch({ type: modalActions.ADD_MODAL });
    }
    function removeModal() {
        modalDispatch({ type: modalActions.REMOVE_MODAL });
    }

    function closeModal() {
        modalDispatch({ type: modalActions.CLOSE_MODAL });

        setTimeout(() => {
            removeModal();
        }, 150);
    }

    function toggleModal() {
        modalDispatch({ type: modalActions.TOGGLE_MODAL });
    }

    return (
        <ModalContext.Provider
            value={{
                modalState,
                modalDispatch,
                openModal,
                closeModal,
                toggleModal,
                addModal,
                removeModal,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}

export function useModalState() {
    const modalContext = useContext(ModalContext);

    return modalContext;
}
