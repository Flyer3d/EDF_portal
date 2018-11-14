import FormMixin from '~/mixins/common/FormMixin';
import {mapGetters, mapActions} from 'vuex';
import _ from 'lodash';

export default {
    extends: FormMixin,
    data: () => ({
        loading: false,
        gui: (process.env.gui && process.env.gui.autoStepWidget) || {}
    }),
    watch: {
        saveStatus (value) {
            if (value === 'IN_PROGRESS') {
                this.loading = true;
                this.$root.$emit('veil', {
                    type: 'info',
                    msg: this.gui.msg.terminatingStep,
                    timeout: 6000
                });
                this.onInProgress();
            } else if (value === 'SUCCESS') {
                this.loading = false;
                this.$root.$emit('unveil', {
                    type: 'success',
                    msg: this.gui.msg.stepSuccess,
                    timeout: 6000
                });
                this.onSuccess();
            } else if (value === 'ERROR') {
                this.loading = false;
                const error = _.get(this.error, 'response.data.message');
                this.$root.$emit('unveil', {
                    type: 'error',
                    msg: `${this.gui.msg.stepError} ${error}`,
                    timeout: 20000
                });
                this.onError();
            } else {
                this.onUnknownStatus();
            }
        }
    },
    computed: {
        ...mapGetters({
            saveStatus: 'action/stepStatus'
        })
    },
    methods: {
        ...mapActions({
            saveMonoStepData: 'action/takeStep'
        }),
        submit () {
            if (this.validate()) {
                this.$root.$emit('say', {
                    type: 'error',
                    msg: this.gui.validatingError,
                    timeout: 6000
                });
                return;
            }
            const fields = this.getFields();
            console.log('[submit] Submitting monostep data');
            console.dir({
                fields,
                entityName: this.modelName,
                processName: this.processName
            });
            if (this.processName) {
                this.saveMonoStepData({
                    fields,
                    entityName: this.modelName,
                    processName: this.processName
                });
            } else {
                console.error('[submit] processName is empty!');
            }
        },
        // Заглушки для реакции на статусы выполнения шага
        // Необходимо переопределить в компоненте
        onError () {},
        onSuccess () {},
        onUnknownStatus () {},
        onInProgress () {}

    }
};
