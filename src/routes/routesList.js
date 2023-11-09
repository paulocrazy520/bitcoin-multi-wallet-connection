import LayoutSimple from "../components/LayoutSimple";
import Home from "../pages/Home";

export const withOutLayoutRoutes = [
    {
        path: "/",
        Element: LayoutSimple,
        children: [{ path: "/", Element: Home, index: true }],
    },
];
