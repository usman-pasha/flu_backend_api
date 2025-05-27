import authRoute from "./auth.route.js";
import accountRoute from "./account.route.js";
import promotionRoute from "./promotion.route.js";

const routes = (app, apiKey) => {
    app.use(`${apiKey}/auth`, authRoute)
    app.use(`${apiKey}/account`, accountRoute)
    app.use(`${apiKey}/promotion`, promotionRoute)
}

export default routes;