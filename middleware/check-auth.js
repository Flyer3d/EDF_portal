import { getTokenFromCookie, getTokenFromLocalStorage } from '~/utils/auth';
import _ from 'lodash';

const ADMIN_PATH = 'admin';
const USER_PATH = 'user';
const ERROR_PATH = 'error';
const DEFAULT_PATH = 'default';
const AUTH_PATH = 'auth';

const sitePath = [ADMIN_PATH, USER_PATH, ERROR_PATH, DEFAULT_PATH, AUTH_PATH];

export default function ({ store, redirect, route, req }) {
    // If nuxt generate, pass this middleware
    if (process.server && !req) return;

    console.log(`[middleware/check-auth] isServer = ${process.server}`);
    console.dir(route);
    const tokenData = process.server ? getTokenFromCookie(req) : getTokenFromLocalStorage();
    console.log(`[middleware/check-auth] Logged user is: `);
    console.dir(tokenData);
    console.dir(route);
    const routeBase = route.fullPath.split('/')[1];
    if (tokenData) { // Авторизованный пользватель
        console.log('Authorized user');
        const {decodedToken} = tokenData;
        const roles = _.compact(_.get(decodedToken, 'EDF_ACM_Role', []).map(role => role.public_id));
        const isAdmin = roles.indexOf('web_admin') !== -1;
        if (isAdmin) { // Права администратора
            if (sitePath.indexOf(routeBase) === -1) {
                redirect(`/${ADMIN_PATH}${route.fullPath}`);
            }
        } else { // Обычный пользователь
            if (routeBase === ADMIN_PATH) {
                redirect(`/${ERROR_PATH}/403`);
            } else if (sitePath.indexOf(routeBase) === -1) {
                redirect(`/${USER_PATH}${route.fullPath}`);
            }
        }
    } else { // Неавторизованный пользователь
        if (routeBase === ADMIN_PATH) {
            redirect(`/${ERROR_PATH}/403`);
        } else if (routeBase === USER_PATH) {
            redirect(`/${AUTH_PATH}`);
        } else if (sitePath.indexOf(routeBase) === -1) {
            redirect(`/${DEFAULT_PATH}${route.fullPath}`);
        }
    }
    store.dispatch('login/setToken', tokenData);
}
