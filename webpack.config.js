module.exports = (isProduction) => ({
    entry: "./src/client/js/app.js",
    mode: isProduction ? 'production' : 'development',
    output: {
        library: "app",
        filename: "app.js"
    },
    devtool: false,
    module: {
        rules: getRules(isProduction)
    },
});
-login adminşifre (admin şifresi ile giriş)
-dark (karanlık tema)
-border (oyun oynanan alana çizgi çeker)
-mass (kaç adet baloncuk topladığını sayar)
-contiunity (akıcılık / süreklilik sağlar)
-foodrounded (yuvarlak baloncuk)
-kick kullanıcı (oyuncu banlar)
function getRules(isProduction) {
    if (isProduction) {
        return [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            }
        ]
    }
    return [];
}
