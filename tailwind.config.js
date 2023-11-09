module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    plugins: [require("daisyui")],

    // daisyUI config (optional)
    daisyui: {
        styled: true,
        themes: true,
        base: true,
        utils: true,
        logs: true,
        rtl: false,
        prefix: "",
        darkTheme: "dark",

        themes: [
            {
                mytheme: {
                    primary: "#6900ff",
                    secondary: "#ffffff",
                    accent: "#000",
                    neutral: "#000",
                },
            },
        ],
    },
};
