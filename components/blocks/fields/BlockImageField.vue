<template>
    <v-layout class='form__field-wrapper' v-if='!isEditable'>
        <v-flex>
            <div xs12 sm12 md12 class='form__label text-xs-left mb-2'
                 :class='{required: isRequired, dark: dark, disabled: disabled}'>
                {{fieldLabel}}
            </div>
            <img
                    v-if='img'
                    height='200px'
                    width='100%'
                    :src=img
            >
        </v-flex>
    </v-layout>
    <v-layout class='form__field-wrapper' v-else>
        <v-flex>
            <div v-if='!noLabel' class='form__label text-xs-left mb-2'
                 :class='{required: isRequired, dark: dark, disabled: disabled}'>
                {{fieldLabel}}
            </div>
            <v-layout align-end justift-start>
                <v-flex style='flex: 0 0 200px;'>
                    <span ref='img'><img :src='src ? src : defaultImg' :width='200' :height='200'></span>
                </v-flex>
                <v-flex class='text-xs-left mb-3' style='flex: 0 0 300px;'>
                    <div>{{help}}</div>
                    <v-btn @click.native='onFocus' dark class='ml-0'>
                        <v-avatar size='20' tile class='mr-2'>
                            <v-icon color='green' v-if='fileName && !error'>done</v-icon>
                            <img :src='iconErrorSrc' v-else-if='error'>
                            <img :src='iconSrc' v-else>
                        </v-avatar>
                        <span>Upload file</span>
                    </v-btn>
                    <input
                            type='file'
                            accept='image/*'
                            :multiple='false'
                            ref='fileInput'
                            @change='onFileChange'
                    />
                </v-flex>
            </v-layout>
        </v-flex>
    </v-layout>
</template>

<script>
    import BlockFieldMixin from '~/mixins/BlockFieldMixin';

export default {
  name: 'widget-image-field',
  mixins: [BlockFieldMixin],
  props: {
    help: {
      type: String
    }
  },
  data () {
    return {
      gui: (process.env.gui && process.env.gui.widgetImageField) || {},
      defaultImg: `${process.env.base}img/default/defaultIcon.svg`,
      iconSrc: `${process.env.base}img/icons/download_white.svg`,
      iconErrorSrc: `${process.env.base}img/icons/download_error.svg`,
      fileName: '',
      fileStorage: 'images',
      src: null,
      form: null
    };
  },
  mounted () {
    if (
      this.inputData &&
      this.inputData !== 'null' &&
      this.inputData !== 'undefined'
    ) {
      const splittedVal = this.inputData.split('://');
      this.fileName = splittedVal[1];
      this.fileStorage = splittedVal[0] || 'images';
    } else {
      this.fileName = this.editable ? '' : 'Не задан';
      this.fileStorage =
        (this.field.defaultValue && this.field.defaultValue.split('://')[0]) ||
        'images';
    }
  },
  computed: {
    isEmpty () {
      return !this.fileName;
    },
    img () {
      if (this.fieldData && this.fieldData.split('://')[1]) {
        return `${process.env.apiBase}/img/${this.fileName}`;
      }
      return '';
    },
    isError () {
      return !this.editable && this.isEmpty;
    }
  },
  methods: {
    getData () {
      console.log(
        `[WidgetImageField] getting data! fieldName = ${this.fieldName}`
      );
      if (this.fieldName === 'Не задан') {
        console.dir({
          name: this.field.name,
          value: undefined,
          type: this.field.type,
          form: null
        });
        return {
          name: this.field.name,
          value: undefined,
          type: this.field.type,
          form: null
        };
      }
      console.dir({
        name: this.field.name,
        value: null,
        fileName: this.fileName,
        type: this.field.type,
        form: this.form,
        fileStorage: this.fileStorage
      });
      return {
        name: this.field.name,
        value: null,
        fileName: this.fileName,
        type: this.field.type,
        form: this.form,
        fileStorage: this.fileStorage
      };
    },
    getSingleFormData (file) {
      if (file) {
        const form = new FormData();
        form.append('file', file, file.name);
        return form;
      }
      return null;
    },
    onFocus () {
      this.error = false;
      this.$refs.fileInput.click();
    },
    onFileChange ($event) {
      const files = $event.target.files || $event.dataTransfer.files;
      console.log('[WidgetImageField] onFileChange');
      console.dir(files);
      this.form = this.getSingleFormData(files[0]);
      const file = files && files[0];
      if (files) {
        if (files.length > 0) {
          if (!file.type.match('image.*')) {
            alert('Image only please....');
            this.fileName = null;
            this.$refs.img.innerHTML = '';
          } else {
            this.fileName = files[0].name;
            const reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (theFile => e => {
              // Render thumbnail.
              console.log('[WidgetImageField] InnerHTML CREATED!!!');
              console.dir(this.$refs);
              this.src = e.target.result;
            })(file);
            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
          }
        } else {
          this.fileName = null;
          this.$refs.img.innerHTML = '';
        }
      }
    }
  }
};
</script>

<style lang='stylus'>
    input[type=file]
        position: absolute
        left: -99999px

</style>
