<template>
    <v-card flat class="contacts-widget">
        <v-card-text>
            <v-container grid-list-md>
                <v-layout row wrap class="mt-4 contacts-widget__field-layout">
                    <v-flex md6 xs12 class="contacts-widget__field">
                        <v-text-field
                                name="organization"
                                label="Название организации"
                                :error="Errors.organization"
                                @focus="clearError('organization')"
                                @blur="validate('organization', ['required'])"
                                v-model="Form.organization"
                                :rules="Rules.organization"
                        ></v-text-field>
                    </v-flex>
                    <v-flex md6 xs12 class="contacts-widget__field">
                        <v-text-field
                                name="fio"
                                label="ФИО"
                                :error="Errors.fio"
                                @focus="clearError('fio')"
                                @blur="validate('fio', ['required'])"
                                v-model="Form.fio"
                                :rules="Rules.fio"
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout row wrap class="mt-4 contacts-widget__field-layout">
                    <v-flex md6 xs12 class="contacts-widget__field">
                        <v-text-field
                                ref="phone"
                                name="phone"
                                label="Телефон"
                                :error="Errors.phone"
                                @focus="clearError('phone')"
                                @blur="validate('phone', ['required', 'phone'])"
                                v-model="Form.phone"
                                :rules="Rules.phone"
                        ></v-text-field>
                    </v-flex>
                    <v-flex md6 xs12 class="contacts-widget__field">
                        <v-text-field
                                ref="email"
                                name="email"
                                label="E-mail"

                                :error="Errors.email"
                                @focus="clearError('email')"
                                @blur="validate('email', ['required', 'email'])"
                                v-model="Form.email"
                                :rules="Rules.email"
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout class="mt-4 contacts-widget__field-layout">
                    <v-flex md12 class="contacts-widget__field">
                        <v-text-field
                                name="message"
                                label="Сообщение"

                                :error="Errors.message"
                                @focus="clearError('message')"
                                @blur="validate('message', ['required'])"
                                v-model="Form.message"
                                :rules="Rules.message"
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-btn round color="primary" dark large class="contacts-widget__btn mt-4" @click="btnSubmit">
                    Отправить
                </v-btn>
                <div class="text-slall mt-3 mb-3">
                    Нажимая кнопку «Отправить», я даю свое согласие на обработку персональных данных
                </div>
            </v-container>
        </v-card-text>

    </v-card>
</template>
<script>
    import _ from 'lodash';
    import axios from 'axios';

    export default {
        name: 'card-widget',
        props: {
            id: {
                required: true,
                type: String
            },
            editable: {
                required: false,
                type: Boolean,
                default: false
            },
            inputData: {
                required: false,
                type: Object,
                default: undefined
            }
        },
        data () {
            return {
                $bus: this.storeBus,
                masterWidget: '',
                submitErrorData: {},
                Form: {
                    organization: '',
                    fio: '',
                    phone: '',
                    email: '',
                    message: ''
                },
                wasFocused: {
                    organization: false,
                    fio: false,
                    phone: false,
                    email: false,
                    message: false
                },
                Errors: {
                    organization: false,
                    fio: false,
                    phone: false,
                    email: false,
                    message: false
                },
                Rules: {
                    organization: [true],
                    fio: [true],
                    phone: [true],
                    email: [true],
                    message: [true]
                },
                rules: {
                    required: value => {
                        return (!!value && (value.length > 1)) || 'Обязательное поле!';
                    },
                    email: (value) => {
                        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                        return (!this.$refs.email.hasFocused || !value || pattern.test(value)) || 'Неверный формат электронной почты';
                    },
                    phone: (...value) => {
                        const pattern = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
                        return (!this.$refs.phone.hasFocused || !value || pattern.test(value)) || 'Неверный формат телефонного номера';
                    }
                }
            };
        },
        watch: {

        },
        computed: {
            options () {
                return this.$store.getters[`${this.id}/getOptions`];
            }
        },
        methods: {
            btnSubmit () {
                let valid = true;
                _.forEach(_.keys(this.Errors), key => {
                    if (!this.wasFocused[key]) {
                        this.Rules[key] = ['Обязательное поле!'];
                        this.Errors[key] = true;
                        valid = false;
                    } else {
                        valid = valid && !this.Errors[key];
                    }
                });

                if (!valid) {
                    return;
                }
                const description = `Contact message: \n\n` +
                    `FIO: ${this.Form.fio}\n\nOrganization: ${this.Form.organization}\n\n` +
                    `Phone: ${this.Form.phone}\n\nE-mail: ${this.Form.email}\n\n` +
                    `Message: ${this.Form.message}\n`;
                console.log(`Sending request to: ${this.options.email}`);
                console.log('[ContactsWidget] Data is:');
                console.dir(this.Form);
                console.dir(description);
                this.$root.$emit('veil', {
                    type: 'info',
                    msg: `Sending contact form`,
                    timeout: 6000
                });
                axios.post(`${process.env.apiBase}/mailto/slava`, {
                    subject: `BAAS: Contacts from ${this.Form.fio}`,
                    to: this.Form.email,
                    from: this.options.email,
                    body: description
                }).then((res) => {
                    this.success = true;
                    console.log('Contact form successeful sended!');
                    console.dir(res.data);
                    this.$root.$emit('unveil', {
                        type: 'success',
                        msg: `Contact form successfully sended`,
                        timeout: 6000
                    });
                }, (err) => {
                    console.log('Error sending request!');
                    console.dir(err);
                    this.$root.$emit('unveil', {
                        type: 'error',
                        msg: `Error sending contact form! \n\n ${err}`,
                        timeout: 20000
                    });
                });
            },
            validate (field, validators) {
                let errors = [];
                const value = this.Form[field];
                validators.forEach(v => {
                    const res = this.rules[v](value);
                    if (res !== true) {
                        errors.push(res);
                    }
                });
                if (errors.length > 0) {
                    this.Rules[field] = errors;
                    this.Errors[field] = true;
                }
            },
            clearError (field) {
                this.Rules[field] = [true];
                this.Errors[field] = false;
                this.wasFocused[field] = true;
            }
        }
    };
</script>

<style lang="stylus">

    .card-widget
        .card-widget
            &__layout
                align-items center

    .contacts-widget
        .contacts-widget

            &__link
                cursor pointer

            &__btn
                margin 40px auto 40px
                display block
                @media all and (max-width: 599px)
                    margin 8px auto


</style>
