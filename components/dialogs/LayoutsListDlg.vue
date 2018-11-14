<template>
    <v-card>
        <v-toolbar :color="'primary'" dark>
            <v-toolbar-side-icon></v-toolbar-side-icon>
            <v-btn icon @click.stop="openLayoutCreateDlg">
                <v-icon>add</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-toolbar-title>{{gui.dialogs.layoutListTitle}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="layoutListDlg=false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-toolbar>
        <v-card-text style="max-height: 80vh;">
            <v-list two-line subheader>
                <v-subheader inset>{{gui.dialogs.layoutListPublished}}</v-subheader>
                <v-list-tile avatar v-for="(item, i) in publishedLayouts" v-bind:key="i"
                             @click="selectLayoutDlg(item)">
                    <v-list-tile-avatar>
                        <v-icon v-bind:class="[item.iconClass]">{{ item.icon }}</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple @click.stop="openDeleteLayoutDlg(item)">
                            <v-icon color="grey lighten-1">remove_circle</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                <v-divider inset></v-divider>
                <v-subheader inset>{{gui.dialogs.layoutListDraft}}</v-subheader>
                <v-list-tile v-for="(item, i) in draftLayouts" v-bind:key="i" avatar
                             @click="selectLayoutDlg(item)">
                    <v-list-tile-avatar>
                        <v-icon v-bind:class="[item.iconClass]">{{ item.icon }}</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple @click.stop="cloneLayout(item)">
                            <v-icon color="grey lighten-1">file_copy</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                    <v-list-tile-action>
                        <v-btn icon ripple @click.stop="openDeleteLayoutDlg(item)">
                            <v-icon color="grey lighten-1">remove_circle</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'layouts-list-dlg'
    };
</script>

<style scoped>

</style>
