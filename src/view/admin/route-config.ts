import {App} from "./app";
import {OpLinks} from "./components/home/home";
import {Settings} from "./components/settings/settings";
import {Player} from "./components/player/player";
import {Activity} from "./components/activity/activity";
import {Rank} from "./components/rank/rank";
import {ExternalData} from "./components/external/external-data";
export function configureRouter(router:vuejs.Router<App>) {
    router.map({
        '/': {
            component: OpLinks,
            name: 'home'
        },
        '/player': {
            component: Player,
            name: 'player'
        },
        '/activity': {
            component: Activity,
            name: 'activity'
        },
        '/rank': {
            component: Rank,
            name: 'rank'
        },
        '/external': {
            component: ExternalData,
            name: 'external'
        },
        '/external/:page': {
            component: ExternalData,
        },
        '/settings': {
            component: Settings,
            name: 'settings'
        }
    });

    router.afterEach((transition) => {
        var toPath = transition.to.path;
        router.app.active = toPath.split("/")[1];
    });
}
