import authRoute from "./auth.route.js";
import accountRoute from "./account.route.js";

const routes = (app, apiKey) => {
    app.use(`${apiKey}/auth`, authRoute)
    app.use(`${apiKey}/account`, accountRoute)
}

export default routes;