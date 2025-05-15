import authRoute from "./auth.route.js";

const routes = (app,apiKey) => {
    app.use(`${apiKey}/auth`, authRoute)
}

export default routes;