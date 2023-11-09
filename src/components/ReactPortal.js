import { createPortal } from "react-dom";

function ReactPortal({ children, wrapperId = "#modal" }) {
    return createPortal(children, document.querySelector(wrapperId));
}
export default ReactPortal;
