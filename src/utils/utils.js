export function setDarkModeVariables() {
    document.documentElement.style.setProperty("--color-base", "#000000");
    document.documentElement.style.setProperty("--color-base1", "#1f1e1e");
    document.documentElement.style.setProperty("--color-base2", "#373737");
    document.documentElement.style.setProperty("--color-text", "#ffffff");
    document.documentElement.style.setProperty("--color-backgroundDim", "rgba(0, 0, 0, 0.5)");
    document.documentElement.style.setProperty(
        "--color-boxShadow",
        "0px 4px 20px rgba(0, 0, 0, 0.11)"
    );
    document.documentElement.style.setProperty("--color-border", "#373737 ");
    document.documentElement.style.setProperty("--theme", "dark");
}

export function setLightModeVariables() {
    document.documentElement.style.setProperty("--color-base", "#ffffff");
    document.documentElement.style.setProperty("--color-base1", "#ffffff");
    document.documentElement.style.setProperty("--color-base2", "#ffffff");
    document.documentElement.style.setProperty("--color-text", "#000");
    document.documentElement.style.setProperty("--color-backgroundDim", "rgba(255, 255, 255, 0.5)");
    document.documentElement.style.setProperty(
        "--color-boxShadow",
        "0px 4px 20px rgba(0, 0, 0, 0.11)"
    );
    document.documentElement.style.setProperty("--color-border", "#f0f0f0 ");
    document.documentElement.style.setProperty("--theme", "light");
}
