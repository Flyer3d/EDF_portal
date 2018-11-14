import axios from 'axios';

const state = () => ({
});

const getters = {

};

const actions = {
    // //////////////////////////////MODEL SECTION////////////////////////////////////
    /**
     * Download file
     *
     * @param payload       {Object} File params {fileName, fileStorage}
     */
    async downloadFile ({ commit, dispatch }, payload) {
        console.log('[utils/downloadFile] Downloading file... ');
        console.dir(payload);
        const url = `${process.env.apiBase}/utils/downloadFile`;
        if (payload.fileName) {
            try {
                const res = await axios({
                    url,
                    method: 'GET',
                    responseType: 'blob', // important
                    headers: {'Content-Type': 'multipart/form-data', 'Authorization': axios.defaults.headers.common['Authorization']},
                    params: payload
                });
                console.log('[utils/downloadFile] Response received!!!');
                console.dir(res);
                const headers = res.headers;
                const blob = new Blob([res.data], {type: headers['content-type']});
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                let fileName = payload.fileName;
                if (fileName.indexOf('UID/') === 0) {
                    fileName = fileName.split('/')[2];
                }
                link.href = downloadUrl;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                console.log('[utils/downloadFile] File downloaded!!');
                console.dir(res.data);
            } catch (err) {
                console.error('[utils/downloadFile] Error downloading file !');
                console.dir(err);
            }
        }
    }

    // //////////////////////////////MODEL SECTION////////////////////////////////////
};

const mutations = {

};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
