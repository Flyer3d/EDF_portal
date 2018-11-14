export default {
    methods: {
        downloadFile (str) {
            if (str && typeof str === 'string') {
                const [fileStorage, fileName] = str.split('://');
                if (fileName) {
                    this.$store.dispatch(`utils/downloadFile`, {fileName, fileStorage});
                }
            }
        },
        getFileName (str) {
            if (str && typeof str === 'string') {
                const [, fileName] = str.split('://');
                if (fileName) {
                    if (fileName.indexOf('UID/') === 0) {
                        return fileName.split('/')[2];
                    }
                    return fileName;
                }
            }
            return '';
        }
    }
};
