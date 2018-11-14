import _ from 'lodash';
import {mapGetters, mapActions} from 'vuex';

export default {
    computed: {
        ...mapGetters({
            bookmarksList: 'bookmark/getProjectBookmarkList'
        }),
        ourBookmark () {
            return _.find(this.bookmarksList, item => item.object.entityId === this.itemId);
        },
        isBookmarked () {
            return !_.isEmpty(this.ourBookmark);
        }
    },
    methods: {
        ...mapActions({
            addBookmark: 'bookmark/addBookmark',
            removeBookmark: 'bookmark/removeBookmark'
        }),
        bookmark () {
            if (this.isBookmarked) {
                this.removeBookmark(_.get(this.ourBookmark, 'entityInstancePk.entityInstanceId'));
            } else {
                this.addBookmark({
                    entityId: this.itemId,
                    entityDesc: this.itemEntityDesc,
                    entityType: 'project'
                });
            }
        }
    }
};
