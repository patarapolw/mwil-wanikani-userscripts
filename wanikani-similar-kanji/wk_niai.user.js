// ==UserScript==
// @name        Wanikani Niai Similar Kanji
// @version     1.3.7
// @author      acm
// @description Adds a visually similar kanji section to content pages, reviews, and lessons
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @namespace   wk_niai
//
// @include     *://www.wanikani.com/kanji/*
// @include     *://www.wanikani.com/review/session*
// @include     *://www.wanikani.com/lesson/session*
// @include     *://preview.wanikani.com/kanji/*
// @include     *://preview.wanikani.com/review/session*
// @include     *://preview.wanikani.com/lesson/session*
//
// @updateURL   https://github.com/mwil/wanikani-userscripts/raw/master/wanikani-similar-kanji/wk_niai.user.js
// @downloadURL https://github.com/mwil/wanikani-userscripts/raw/master/wanikani-similar-kanji/wk_niai.user.js
//
// @resource    from_keisei_db https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/from_keisei_esc.json
// @resource    stroke_dist_db https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/stroke_edit_dist_esc.json
// @resource    yl_radical_db  https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/yl_radical_esc.json
// @resource    old_script_db  https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/old_script_esc.json
// @resource    noto_db        https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/wk_niai_noto_esc.json
// @resource    manual_db      https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/manual_esc.json
// @resource    lookup_db      https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/db/lookup_esc.json
//
// @resource    niai_style     https://raw.githubusercontent.com/mwil/wanikani-userscripts/master/wanikani-similar-kanji/css/wk_niai.css
//
// @resource    chargrid       https://raw.githubusercontent.com/mwil/wanikani-userscripts/a8853dc81942249e98e8091b404aadc28c092d99/styles/css/chargrid.css
// @resource    bootstrapcss   https://raw.githubusercontent.com/mwil/wanikani-userscripts/7caebf537b4d02084d85f1a19d26b50c185d8d05/styles/bootstrap/css/bootstrap.crop.css
//
// @resource    bootstrap-js   https://raw.githubusercontent.com/mwil/wanikani-userscripts/8d4694c53273fbac4e6b888f4ab95a3fa16d31c5/styles/bootstrap/js/bootstrap.js
// @resource    b-dropdown-js  https://raw.githubusercontent.com/mwil/wanikani-userscripts/7caebf537b4d02084d85f1a19d26b50c185d8d05/styles/bootstrap/js/bootstrap-dropdown.js
//
// @require     https://greasyfork.org/scripts/430565-wanikani-item-info-injector/code/WaniKani%20Item%20Info%20Injector.user.js?version=958983
//
// @require     https://raw.githubusercontent.com/mwil/wanikani-userscripts/3557aa7900d86e54bdb4ab29eda34feb46ac64b1/wanikani-similar-kanji/wk_niai.db.js
// @require     https://raw.githubusercontent.com/mwil/wanikani-userscripts/a8853dc81942249e98e8091b404aadc28c092d99/wanikani-similar-kanji/wk_niai.modal.js
// @require     https://raw.githubusercontent.com/mwil/wanikani-userscripts/a8853dc81942249e98e8091b404aadc28c092d99/wanikani-similar-kanji/wk_niai.html.js
// @require     https://raw.githubusercontent.com/mwil/wanikani-userscripts/a8853dc81942249e98e8091b404aadc28c092d99/wanikani-similar-kanji/wk_niai.main.js
//
// @grant       GM_log
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       unsafeWindow
//
// @run-at      document-end
// ==/UserScript==
