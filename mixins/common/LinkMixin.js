export default {
    methods: {
        href (link) {
            if (link && typeof link === 'string') {
                if (link.indexOf('http') === 0) {
                    return link;
                }
                return `http://${link}`;
            }
            return '';
        },
        isEmbed (link) {
            if (link && typeof link === 'string') {
                return link.indexOf('/embed/') !== -1;
            }
            return false;
        }
    }
};
