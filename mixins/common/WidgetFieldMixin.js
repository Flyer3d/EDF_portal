export default {

    // Используемые компоненты:
    components: {
        WidgetDateField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetDateField'),
        WidgetFileField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetFileField'),
        WidgetNumberField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetNumberField'),
        WidgetImageField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetImageField'),
        WidgetCheckboxField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetCheckboxField'),
        WidgetTextAreaField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetTextAreaField'),
        WidgetTextField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetTextField'),
        WidgetGeoPointField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetGeoPointField'),
        WidgetLinkField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetLinkField'),
        WidgetRadioField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetRadioField'),
        WidgetHtmlField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetHtmlField'),
        WidgetDropdownLinkField: () => import(/* webpackChunkName: "Fields" */ '~/components/widgets/fields/WidgetDropdownLinkField')
    },
    methods: {
        // Выбираем нужный компонет в зависимости от типа поля
        getFieldType (type) {
            switch (type) {
                case 'DATE':
                    return 'widget-date-field';
                case 'FILE':
                    return 'widget-file-field';
                case 'LINK':
                case 'HYPERLINK':
                    return 'widget-link-field';
                case 'NUMBER':
                    return 'widget-number-field';
                case 'RADIOBUTTON':
                    return 'widget-radio-field';
                case 'IMAGE':
                    return 'widget-image-field';
                case 'CHECKBOX':
                    return 'widget-checkbox-field';
                case 'TEXT_HTML':
                    return 'widget-html-field';
                case 'GEOPOINT':
                    return 'widget-geo-point-field';
                case 'DROPDOWN_LINK':
                    return 'widget-dropdown-link-field';
                case 'TEXT_AREA':
                    return 'widget-text-area-field';
                case 'TEXT_FIELD':
                default:
                    return 'widget-text-field';
            }
        }
    }
};
