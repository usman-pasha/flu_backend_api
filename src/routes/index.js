import authRoute from "./auth.route.js";
import accountRoute from "./account.route.js";
import promotionRoute from "./promotion.route.js";
import bankRouter from "./bank.routes.js";
import withdrawRouter from "./withdraw.route.js";
import walletRouter from "./wallet.route.js";

const routes = (app, apiKey) => {
    app.use(`${apiKey}/auth`, authRoute);
    app.use(`${apiKey}/account`, accountRoute);
    app.use(`${apiKey}/promotion`, promotionRoute);
    app.use(`${apiKey}/bank`, bankRouter);
    app.use(`${apiKey}/withdraw`, withdrawRouter);
    app.use(`${apiKey}/wallet`, walletRouter);
}

export default routes;