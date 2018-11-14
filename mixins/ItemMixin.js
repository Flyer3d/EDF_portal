import _ from 'lodash';

export default {
    computed: {
        isItemEmpty () {
            return _.isEmpty(this.item);
        },
        isEmpty () {
            return _.isEmpty(this.item);
        },
        itemId () {
            return _.get(this.itemSrc, 'entityInstancePk.entityInstanceId');
        },
        entityId () {
            return _.get(this.itemSrc, 'entityInstancePk.entityInstanceId');
        },
        entityDesc () {
            return _.get(this.itemSrc, 'entityDesc', '');
        },
        entityIcon () {
            return _.get(this.itemSrc, 'entityIcon', '');
        },
        item () {
            return _.get(this.itemSrc, 'object', {});
        }
    }
};
