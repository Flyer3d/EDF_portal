import axios from 'axios';
import _ from 'lodash';
import {setToken, unsetToken, getTokenData} from '~/utils/auth';

const profileModelName = 'Профиль участника';

const defaultUser = {
    user: 'anonymous',
    userId: null,
    roles: ['default']
};

const defaultToken = {
    access_token: null,
    refresh_token: null,
    expires_in: null,
    token_type: null
};

const state = {
    user: Object.assign({}, defaultUser),
    token: Object.assign({}, defaultToken),
    tokenJSON: {},
    profile: {},
    status: 'INITIAL',
    isLoggedIn: false,
    strict: process.env.NODE_ENV !== 'production'
};

const getters = {
    isLoggedIn: st => st.isLoggedIn,

    getUserName: st => st.user.user,
    getRoles: st => st.user.roles || [],
    getUserPublicId: st => st.user.userId,
    getUserId: st => st.user.userId,
    isAdmin: st => st.user.roles.indexOf('web_admin') !== -1,

    getProfile: st => st.profile,
    getProfileId: st => st.profile.__id,
    getProfileIcon: st => {
        const icon = st.profile.__entityIcon;
        if (icon) {
            return icon.split('://')[1];
        }
        return '';
    },
    getProfileName: st => st.profile.__entityDesc,

    getStatus: st => st.status
};

const actions = {
    async login (payload, {login, password}) {
        const { commit } = payload;
        commit('LOGGING_IN');
        console.log(`[login] Logging in to ${process.env.apiBase}/auth/login`);
        console.dir(payload);
        try {
            const { data } = await axios.post(`${process.env.apiBase}/auth/login`, { username: login, password });
            const tokenJSON = getTokenData(data.access_token);
            const profileId = _.get(tokenJSON, 'profileId');
            let profile = {};
            if (profileId) {
                try {
                    console.log(`[login] Getting profile by ID = ${profileId}`);
                    const url = `${process.env.apiBase}/widget/${profileModelName}/${profileId}`;
                    const profileSrc = await axios.get(url);

                    profile = _.get(profileSrc, 'data.rows[0].object', {});
                    profile.__id = profileId;
                    profile.__entityDesc = _.get(profileSrc, 'data.rows[0].entityDesc');
                    profile.__entityIcon = _.get(profileSrc, 'data.rows[0].entityIcon');
                    console.log('[login] Profile loaded successfully');
                    console.dir(profile);
                } catch (err) {
                    console.error('[login] Error loading user profile');
                    console.error(err);
                }
            } else {
                console.log('[login] Empty profileId!');
                const userId = _.get(tokenJSON, 'EDF_ACM_User.public_id');
                if (userId) {
                    try {
                        console.log(`[login] Loading profile for userId ${userId}`);
                        const url = `${process.env.apiBase}/widget`;
                        const profileRes = await axios.get(url, {
                            params: {
                                model: 'Профиль участника',
                                pageNumber: 1,
                                pageSize: 1,
                                query: `[user_id] = '${userId}'`
                            }
                        });

                        profile = _.get(profileRes, 'data.rows[0].object', {});
                        const profileId = _.get(profileRes, 'data.rows[0].entityInstancePk.entityInstanceId');
                        if (profileId) {
                            profile.__id = profileId;
                            profile.__entityDesc = _.get(profileRes, 'data.rows[0].entityDesc');
                            profile.__entityIcon = _.get(profileRes, 'data.rows[0].entityIcon');
                            console.log('[login] Profile loaded successfully');
                            console.dir(profile);
                        } else {
                            console.log('[login] Empty profile!');
                        }
                    } catch (err) {
                        console.error('[login] Error loading user profile');
                        console.error(err);
                    }
                }
            }

            console.log('[login] successfully logged in!!!');
            console.dir(tokenJSON);
            console.dir(data);

            setToken(data.access_token, data.token_type);
            commit('LOGIN_SUCCESS', {tokenData: data, tokenJSON, profile});
            this.app.router.replace(`/`);
        } catch (err) {
            console.log('[login] Error logging in');
            console.dir(err);
            if (err.response && err.response.status === 401) {
                commit('LOGIN_ERROR', 'BAD_CREDENTIALS');
                return false;
            }
            commit('LOGIN_ERROR', 'LOGGING_ERROR');
            return false;
        }
    },
    async setToken ({ commit }, payload) {
        console.log(`[setToken] Setting token`);
        console.dir(payload);
        if (!payload) {
            console.log(`[setToken] Empty payload. Logout...`);
            commit('LOGOUT');
            return;
        }
        const {token, tokenType, decodedToken} = payload;
        const tokenJSON = decodedToken;
        const profileId = _.get(tokenJSON, 'profileId');
        let profile = {};
        if (profileId) {
            try {
                console.log(`[setToken] Getting profile by ID = ${profileId}`);
                const url = `${process.env.apiBase}/widget/${profileModelName}/${profileId}`;
                const profileSrc = await axios.get(url);

                profile = _.get(profileSrc, 'data.rows[0].object', {});
                profile.__id = profileId;
                profile.__entityDesc = _.get(profileSrc, 'data.rows[0].entityDesc');
                profile.__entityIcon = _.get(profileSrc, 'data.rows[0].entityIcon');
                console.log('[setToken] Profile loaded successfully');
                console.dir(profile);
            } catch (err) {
                console.error('[setToken] Error loading user profile');
                console.error(err);
            }
        } else {
            console.log('[setToken] Empty profileId!');
            const userId = _.get(tokenJSON, 'EDF_ACM_User.public_id');
            if (userId) {
                try {
                    console.log(`[setToken] Loading profile for userId ${userId}`);
                    const url = `${process.env.apiBase}/widget`;
                    const profileRes = await axios.get(url, {
                        params: {
                            model: 'Профиль участника',
                            pageNumber: 1,
                            pageSize: 1,
                            query: `[user_id] = '${userId}'`
                        }
                    });

                    profile = _.get(profileRes, 'data.rows[0].object', {});
                    const profileId = _.get(profileRes, 'data.rows[0].entityInstancePk.entityInstanceId');
                    if (profileId) {
                        profile.__id = profileId;
                        profile.__entityDesc = _.get(profileRes, 'data.rows[0].entityDesc');
                        profile.__entityIcon = _.get(profileRes, 'data.rows[0].entityIcon');
                        console.log('[setToken] Profile loaded successfully');
                        console.dir(profile);
                    } else {
                        console.log('[setToken] Empty profile!');
                    }
                } catch (err) {
                    console.error('[setToken] Error loading user profile');
                    console.error(err);
                }
            }
        }

        console.log('[setToken] successfully logged in!!!');
        console.dir(profile);
        console.dir({
            tokenData: {
                access_token: token,
                token_type: tokenType
            },
            tokenJSON: decodedToken,
            profile});

        setToken(token, tokenType);
        commit('LOGIN_SUCCESS', {
            tokenData: {
                access_token: token,
                token_type: tokenType
            },
            tokenJSON: decodedToken,
            profile});
    },
    async logout ({ commit, state }) {
        console.log('[logout] Logging out...');
        try {
            await axios.post(`${process.env.apiBase}/auth/logout`);
        } catch (err) {
            console.error('[LOGOUT]: Server error:');
            console.dir(err);
        }
        unsetToken(state.token);
        commit('desktop/unregister', null, { root: true });
        commit('site/setEditable', false, { root: true });
        commit('LOGOUT');

        this.app.router.replace('/');
    }

};

const mutations = {

    LOGGING_IN (st) {
        st.status = 'LOGGING_IN';
    },
    LOGIN_SUCCESS (st, payload) {
        const {tokenData, tokenJSON, profile} = payload;
        st.tokenJSON = tokenJSON;
        st.profile = profile;
        st.user = Object.assign({}, defaultUser, {
            user: _.get(tokenJSON, 'EDF_ACM_User.name'),
            userId: _.get(tokenJSON, 'EDF_ACM_User.public_id'),
            roles: _.compact(_.get(tokenJSON, 'EDF_ACM_Role', []).map(role => role.public_id))
        });
        st.token = Object.assign({}, defaultToken, tokenData);
        st.isLoggedIn = true;
    },
    LOGIN_ERROR (st, status) {
        st.status = status;
    },

    LOGOUT (st) {
        st.isLoggedIn = false;
        st.profile = {};
        st.user = Object.assign({}, defaultUser);
        st.token = Object.assign({}, defaultToken);
        delete axios.defaults.headers.common['Authorization'];
        st.status = 'INITIAL';
    },
    SET_HEADER (st) {
        console.log(`[SET_HEADER] Setting Header!`);
        console.dir(st.user);
        if (st.user.access_token) {
            axios.defaults.headers.common['Authorization'] = `${st.user.token_type} ${st.user.access_token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    // SET_STATUS (st, status) {
    //    st.status = status;
    // },
    // SET_HEADER (st) {
    //     console.log(`[SET_HEADER] Setting Header!`);
    //     console.dir(st.user);
    //    if (st.user.access_token) {
    //        axios.defaults.headers.common['Authorization'] = `${st.user.token_type} ${st.user.access_token}`;
    //    } else {
    //        delete axios.defaults.headers.common['Authorization'];
    //    }
    // },
    // SET_USER (st, payload) {
    //     console.log('LOGIN save params with payload:');
    //     console.dir(payload);
    //     // st.user = payload;
    //     if (payload) {
    //         st.user = Object.assign({}, payload);
    //         st.isLoggedIn = true;
    //         axios.defaults.headers.common['Authorization'] = `${payload.token_type} ${payload.access_token}`;
    //     } else {
    //         st.isLoggedIn = false;
    //         st.user = Object.assign({}, defaultUser);
    //         delete axios.defaults.headers.common['Authorization'];
    //     }
    // },
    // SET_PROFILE (st, payload) {
    //     console.log('[SET_PROFILE] Setting profile to:');
    //
    //     st.profile = payload;
    //     console.dir(st.profile);
    // },
    // logout (st) {
    //     st.isLoggedIn = false;
    //     delete axios.defaults.headers.common['Authorization'];
    //     st.login = '';
    // }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
