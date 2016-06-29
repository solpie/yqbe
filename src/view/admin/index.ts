import Vue = require('vue');
Vue.use(require('vue-resource'));

import VueRouter = require('vue-router');
Vue.use(VueRouter);

import {App} from "./app";
const router = new VueRouter<App>();

import {configureRouter} from "./route-config";
configureRouter(router);
router.start(App, '#app');