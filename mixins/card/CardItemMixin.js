import ItemMixin from '~/mixins/ItemMixin';

export default {
    extends: ItemMixin,
    props: {
        itemSrc: {
            type: Object,
            required: true
        }
    }
};
