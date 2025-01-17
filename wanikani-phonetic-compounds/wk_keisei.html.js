/* jshint esversion: 6 */
/* jshint scripturl:true */

// #############################################################################
(function()
{
    "use strict";

    // Character item to be included in a character grid
    // #########################################################################
    WK_Keisei.prototype.gen_item_chargrid = ({kanji, readings, meanings, wk_level, notInWK=``, badge=``, href=`javascript:;`, kanji_id=`kanji-0`, rnd_style=``}) =>
       `<li id="${kanji_id}" class="${notInWK} character-item">
            <span lang="ja" class="${badge}" data-kanji="${kanji}"></span>
            <a class="keisei_kanji_link" href="${href}">
                <span class="character" lang="ja" title="WK Level: ${wk_level}">${kanji}</span>
                <ul>
                    <li title="${readings.join("・")}" class="${rnd_style}">${readings[0]}</li>
                    <li title="${meanings.join(", ")}" class="ellipsis">${meanings[0]}</li>
                </ul>
            </a>
        </li>`;
    // #########################################################################
}
)();
// #############################################################################

// #############################################################################
(function()
{
    "use strict";

    // #########################################################################
    // Insert stubs for all information fields to be filled later by
    // populateKeiseiSection().
    //
    // Some section may stay empty, for example when a kanji is not related to
    // phonetic compounds.
    // #########################################################################
    WK_Keisei.prototype.createKeiseiSection = function(style)
    {
        const $section = $(`<section></section>`)
                         .attr(`id`, `keisei_section`)
                         .attr(`style`, style)
                         .addClass(`${GM_info.script.namespace} col1`);

        // Control buttons on the right of the section header
        const $view_btn = $(`<span class="btn-group"></span>`)
                          .append(`<a class="btn disabled" id="keisei_head_moreinfo">
                                       <i class="fa fa-caret-square-o-up"></i>
                                   </a>`)
                          .append(`<a class="btn" id="keisei_head_visibility">
                                      <i class="fa fa-eye"></i>
                                   </a>`);

        const $main_btn = $(`<span class="btn-group"></span>`)
                          .append(`<a class="btn" id="keisei_head_settings" data-toggle="modal" data-target="#keisei_modal_settings">
                                        <i class="fa fa-gear"></i>
                                   </a>`)
                          .append(`<a class="btn" id="keisei_head_info" data-toggle="modal" data-target="#keisei_modal_info">
                                        <i class="fa fa-question"></i>
                                   </a>`);

        const $head_grp = $(`<span></span>`)
                          .attr(`id`, `keisei_head_btn_group`)
                          .addClass(`btn-group pull-right`)
                          .append($view_btn)
                          .append($main_btn);

        const $head_kanji_input = $('<form style="all:unset; display:inline-block">')
            .attr('id', 'keisei_head_kanji_input')
            .append(
                $(`<input type="text" lang="ja" value="${
                    this.currentSubject.kan || ''
                }" style="all:unset; cursor:pointer">`)
            )
            .on('submit', (ev) => {
                ev.preventDefault();
                const [elInput] = ev.target.elements;
                const [k] = elInput.value
                    .replace(/[\p{scx=Hiragana}\p{scx=Katakana}\w\s]/gu, '')
                    .trim();
                if (k) {
                    this.populateKeiseiSection({
                        kan: k,
                        phon: wk_keisei.kdb.getKPhonetic(k),
                    });
                }
            });

        const $head = $(`<h2>Phonetic-Semantic Composition of&nbsp;</h2>`)
                      .append($head_kanji_input)
                      .append($head_grp)
                      .appendTo($section);

        // Text sections and folds
        $section.append($(`<div></div>`)
                        .attr(`id`, `keisei_explanation`));

        const $main_fold = $(`<div></div>`)
                           .attr(`id`, `keisei_main_fold`)
                           .appendTo($section);

        const $grid = $(`<div></div>`)
                      .attr(`id`, `keisei_main_phonetic_grid`)
                      .addClass(`keisei_phonetic_grid`)
                      .appendTo($main_fold);

        this.log(`Created the Keisei section, appending to the page!`);

        if (!$(`#keisei_modal_settings`).length)
            this.injectModals();

        return $section;
    };
    // #########################################################################

    // Sometimes we want to include even more chargrids with related tone marks
    // or kanji that are not considered a result of phonetic composition.
    // #########################################################################
    WK_Keisei.prototype.createMoreInfoFold = function()
    {
        const $infofold = $(`<span></span>`)
                          .attr(`id`, `keisei_more_fold`);

        $(`#keisei_head_moreinfo`).removeClass(`disabled`);

        // #####################################################################
        $(`#keisei_head_moreinfo`).on(`click`, this.toggleMoreInfoFold.bind(this));
        // #####################################################################

        return $infofold;
    };
    // #########################################################################

    // #########################################################################
    WK_Keisei.prototype.toggleMainFold = function(event)
    {
        $(`#keisei_main_fold`).toggle();

        $(`#keisei_head_visibility i`).toggleClass(`fa-eye`);
        $(`#keisei_head_visibility i`).toggleClass(`fa-eye-slash`);

        // if (!$(`#keisei_main_fold`).is(`:visible`) &&
            // !$(`#keisei_head_moreinfo i`).hasClass(`fa-caret-square-o-down`))
            // this.toggleMoreInfoFold();

        return false;
    };
    // #########################################################################

    // Callback function for click events on more info button.
    // #########################################################################
    WK_Keisei.prototype.toggleMoreInfoFold = function(event)
    {
        $(`#keisei_more_fold`).toggle();

        $(`#keisei_head_moreinfo i`).toggleClass(`fa-caret-square-o-down`);
        $(`#keisei_head_moreinfo i`).toggleClass(`fa-caret-square-o-up`);

        // if ((!$(`#keisei_main_fold`).is(`:visible`) &&
            // !$(`#keisei_head_moreinfo i`).hasClass(`fa-caret-square-o-down`)))
            // this.toggleMainFold();
        //
        return false;
    };
    // #########################################################################

    // #########################################################################
    WK_Keisei.prototype.toggleBadgeMarker = function(event)
    {
        const kanji = event.currentTarget.dataset.kanji;

        if (!kanji)
            return false;

        if (kanji in this.override_db)
            this.override_db[kanji].marked = !this.override_db[kanji].marked;
        else
            this.override_db[kanji] = {"marked": true};

        $(event.currentTarget).toggleClass(`badge-marked`);
        GM_setValue(`override_db`, JSON.stringify(this.override_db));

        return false;
    };
    // #########################################################################
}
)();
// #############################################################################
