import React, { Suspense, lazy } from "react";
import Spinner from "./components/Spinner";
import BaseLayout from "./components/BaseLayout";

// ** Import Route Providers
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";

const Pool = lazy(() => import("./pages/Pool"));
const Pools = lazy(() => import("./pages/Pools"));

const history = createBrowserHistory({
    basename: "",
    forceRefresh: false,
});

const AppRouter = () => {
    return (
        <Router history={history}>
            <Suspense fallback={<Spinner />}>
                <Switch>
                    <Route path="/" exact>
                        <Redirect to="/pools" />
                    </Route>
                    <BaseLayout>
                        <Route path="/pools" exact component={Pools} />
                        <Route path="/pools/:id" exact component={Pool} />
                    </BaseLayout>
                </Switch>
            </Suspense>
        </Router>
    );
};

export default AppRouter;
