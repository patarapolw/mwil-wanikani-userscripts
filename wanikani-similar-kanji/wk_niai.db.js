/* jshint esversion: 6 */

function NiaiDB()
{
    this.override_db = {};
    this.wkof_items = null;
}


// #############################################################################
(function() {
   "use strict";

    NiaiDB.prototype = {
        constructor: NiaiDB,

        init: function(override_db)
        {
            this.override_db = override_db;

            if (typeof wkof === `object`)
                this.wkof_items = this.load_wkof_items();
        },

        load_wkof_items: async function()
        {
            const wkof_config_meaning = {
                wk_items: {
                    options: {
                        assignments: true
                    },
                    filters: {
                        item_type: 'kan'
                    }
                }
            };
            wkof.include(`ItemData`);
            await wkof.ready(`ItemData`);
            let items = await wkof.ItemData.get_items(wkof_config_meaning);
            return wkof.ItemData.get_index(items, `slug`);
        },

        isKanjiInWK: function(kanji)
        {
            // WK started adding new kanji, treat unknown kanji gracefully
            if (!this.isKanjiInDB(kanji))
                return false;

            return (this.lookup_db[kanji].level !== 99);
        },

        isKanjiInDB: function(kanji)
        {
            return (kanji in this.lookup_db);
        },

        isKanjiLocked: function(kanji, level)
        {
            if (this.isKanjiInDB(kanji))
                return (this.lookup_db[kanji].level > level);
            else
                return true;
        },

        getInfo: function(kanji)
        {
            if (!this.isKanjiInDB(kanji))
                return {"meanings": "Not in DB!", "readings": "&nbsp;", level: "N/A"};

            let k_info = this.lookup_db[kanji];

            k_info.readings = k_info[k_info.important_reading];

            return k_info;
        },

        getSimilar: function(kanji, level, sources, min_score)
        {
            // use an object to override with later databases.
            let similar_kanji = {};

            sources.forEach(
                function(source)
                {
                    if (!(kanji in this[source.id]))
                        return;

                    this[source.id][kanji].forEach(
                        function(sim_info)
                        {
                            const hasScore = (
                                typeof sim_info !== `string` &&
                                `score` in sim_info
                            );

                            let sim_kanji = hasScore ? sim_info.kan : sim_info;
                            let score = source.base_score +
                                        (hasScore ? sim_info.score : 0.0);

                            if (!this.isKanjiInDB(sim_kanji))
                            {
                                console.log("Ignoring", kanji, ", not in DB yet!");
                                return;
                            }

                            const old_score = (sim_kanji in similar_kanji ?
                                               similar_kanji[sim_kanji].score :
                                               0.0);

                            if (score > min_score || (score > 0.0 && old_score > 0.0))
                            {
                                similar_kanji[sim_kanji] = {
                                    "kan": sim_kanji,
                                    "score": score,  // why was old_score used here?
                                    "locked": this.isKanjiLocked(sim_kanji, level)
                                };
                            }
                            else if (score < 0)
                            {
                                // negative scores are used to delete unwanted
                                // kanji to make it consistent across all DBs
                                // including the user's local db.
                                delete similar_kanji[sim_kanji];
                            }
                        },
                        this
                    );
                },
                this
            );

            let result = Object.values(similar_kanji);

            result.sort((a,b) => 2*Math.sign(b.score - a.score) +
                                 a.kan.localeCompare(b.kan))
                  .splice(19);

            return result.map((a) => a.kan);
        }
    };

    // Use the WK Open Framework to replace the offine DB of Niai
    // #########################################################################
    WK_Niai.prototype.update_wk_cache = async function(similar_list)
    {
        let index = await this.ndb.wkof_items;
        similar_list.forEach((sim_kanji) => {
            let item = index[sim_kanji];
            if (item) {
                $(`li[id$="${sim_kanji}"]`).toggleClass(`locked`, !item.assignments?.unlocked_at);
                $(`li[id$="${sim_kanji}"] li.niai_meaning`).text(item.data.meanings[0].meaning);
                $(`li[id$="${sim_kanji}"] span.character`).attr(`title`, `WK Level: ${item.data.level}`);
            }
        });
    };
    // #########################################################################
}
());
// #############################################################################

// #############################################################################
NiaiDB.prototype.keisei_db      = JSON.parse(GM_getResourceText(`from_keisei_db`));
NiaiDB.prototype.old_script_db  = JSON.parse(GM_getResourceText(`old_script_db`));
NiaiDB.prototype.yl_radical_db  = JSON.parse(GM_getResourceText(`yl_radical_db`));
NiaiDB.prototype.stroke_dist_db = JSON.parse(GM_getResourceText(`stroke_dist_db`));
NiaiDB.prototype.noto_db        = JSON.parse(GM_getResourceText(`noto_db`));
NiaiDB.prototype.manual_db      = JSON.parse(GM_getResourceText(`manual_db`));
NiaiDB.prototype.lookup_db      = JSON.parse(GM_getResourceText(`lookup_db`));
// #############################################################################
