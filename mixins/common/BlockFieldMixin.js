export default {

    // Используемые компоненты:
    components: {
        BlockDateField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockDateField'),
        BlockFileField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockFileField'),
        BlockNumberField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockNumberField'),
        BlockRadioField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockRadioField'),
        BlockImageField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockImageField'),
        BlockCheckboxField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockCheckboxField'),
        BlockTextAreaField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockTextAreaField'),
        BlockTextField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockTextField'),
        BlockGeoPointField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockGeoPointField'),
        BlockLinkField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockLinkField'),
        BlockDropdownLinkField: () => import(/* webpackChunkName: "Fields" */ '~/components/blocks/fields/BlockDropdownLinkField')
    },
    methods: {
        // Выбираем нужный компонет в зависимости от типа поля
        getFieldType (type) {
            switch (type) {
                case 'DATE':
                    return 'block-date-field';
                case 'FILE':
                    return 'block-file-field';
                case 'LINK':
                case 'HYPERLINK':
                    return 'block-link-field';
                case 'NUMBER':
                    return 'block-number-field';
                case 'RADIOBUTTON':
                    return 'block-radio-field';
                case 'IMAGE':
                    return 'block-image-field';
                case 'CHECKBOX':
                    return 'block-checkbox-field';
                case 'DROPDOWN_LINK':
                    return 'block-dropdown-link-field';
                case 'TEXT_AREA':
                    return 'block-text-area-field';
                case 'GEOPOINT':
                    return 'block-geo-point-field';
                case 'TEXT_FIELD':
                default:
                    return 'block-text-field';
            }
        }
    }
};
