import jwtDecode from 'jwt-decode';
import Cookie from 'js-cookie';

const TOKEN = 'EDF_token';
const TOKEN_TYPE = 'EDF_token_type';

export const setToken = (token, type) => {
    console.log('[setToken] Setting token...');
    window.localStorage.setItem(TOKEN, token);
    window.localStorage.setItem(TOKEN_TYPE, type);
    Cookie.set(TOKEN, token);
    Cookie.set(TOKEN_TYPE, type);
};

export const unsetToken = () => {
    console.log('[unsetToken] Removing token...');
    console.dir(this);
    window.localStorage.removeItem(TOKEN);
    window.localStorage.removeItem(TOKEN_TYPE);
    Cookie.remove(TOKEN);
    Cookie.remove(TOKEN_TYPE);
};

export const getTokenData = (token) => {
    console.log('[getTokenData] Decoding token...');
    console.log(token);
    if (!token || token === 'null') {
        console.err('[getTokenData] Empty token!');
        return;
    }
    let decodedToken;
    try {
        decodedToken = jwtDecode(token);
    } catch (err) {
        console.err('[getTokenData] Cannot decode token:');
        console.err(err);
        return;
    }
    return decodedToken;
};

export const getTokenFromCookie = (req) => {
    console.log('[getUserFromCookie] Getting token data from Cookie...');
    if (!req.headers.cookie) return;

    const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith(`${TOKEN}=`));
    const jwtTypeCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith(`${TOKEN_TYPE}=`));

    if (!jwtCookie) return;

    const token = jwtCookie && jwtCookie.split('=')[1];
    const tokenType = jwtTypeCookie && jwtTypeCookie.split('=')[1];
    const decodedToken = getTokenData(token);
    console.dir(decodedToken);
    return {
        token,
        tokenType,
        decodedToken
    };
};

export const getTokenFromLocalStorage = () => {
    console.log('[getTokenFromLocalStorage] get User from Local storage!');
    console.dir(window.localStorage);
    if (!window.localStorage[TOKEN]) return;

    const token = window.localStorage[TOKEN];
    const tokenType = window.localStorage[TOKEN_TYPE];

    const decodedToken = getTokenData(token);
    console.dir(decodedToken);
    return {
        token,
        tokenType,
        decodedToken
    };
};
