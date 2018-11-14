
import Vue from 'vue';
import VueCodemirror from 'vue-codemirror';

// language
import 'codemirror/mode/vue/vue.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/javascript/javascript.js';

// active-line.js
import 'codemirror/addon/selection/active-line.js';

// styleSelectedText
import 'codemirror/addon/selection/mark-selection.js';
import 'codemirror/addon/search/searchcursor.js';

// autoCloseTags
import 'codemirror/addon/edit/closetag.js';

// autoCloseTags
import 'codemirror-formatting';

// highlightSelectionMatches
// import 'codemirror/addon/scroll/annotatescrollbar.js'
// import 'codemirror/addon/search/matchesonscrollbar.js'
// import 'codemirror/addon/search/searchcursor.js'
// import 'codemirror/addon/search/match-highlighter.js'

// keyMap
// import 'codemirror/mode/clike/clike.js'
// import 'codemirror/addon/edit/matchbrackets.js'
// import 'codemirror/addon/comment/comment.js'
// import 'codemirror/addon/dialog/dialog.js'
// import 'codemirror/addon/dialog/dialog.css'
// import 'codemirror/addon/search/searchcursor.js'
// import 'codemirror/addon/search/search.js'
// import 'codemirror/keymap/sublime.js'

// foldGutter
// import 'codemirror/addon/fold/foldgutter.css'
// import 'codemirror/addon/fold/brace-fold.js'
// import 'codemirror/addon/fold/comment-fold.js'
// import 'codemirror/addon/fold/foldcode.js'
// import 'codemirror/addon/fold/foldgutter.js'
// import 'codemirror/addon/fold/indent-fold.js'
// import 'codemirror/addon/fold/markdown-fold.js'
// import 'codemirror/addon/fold/xml-fold.js'

// more...

Vue.use(VueCodemirror);
