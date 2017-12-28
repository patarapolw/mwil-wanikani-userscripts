import json
import regex

KANJI_DB = "../db/kanji.json"
PHONETIC_DB = "../db/phonetic.json"
WK_RAD_DB = "../db/wk_rad.json"


def phonetic_db_import():
    with open(PHONETIC_DB, "r") as infile:
        phonetic_db = json.load(infile)

    return phonetic_db


def kanji_db_import():
    with open(KANJI_DB, "r") as infile:
        kanji_db = json.load(infile)

    return kanji_db


def wk_rad_db_import():
    with open(WK_RAD_DB, "r") as infile:
        wk_rad_db = json.load(infile)

    return wk_rad_db


def test_kanji_entries_are_consistent():
    kanji_db = kanji_db_import()

    types = [
            "unknown",
            "hieroglyph",
            "indicative",
            "comp_indicative",
            "comp_phonetic",
            "derivative",
            "rebus",
            "kokuji"]

    for kanji, item in kanji_db.items():
        for prop in ["readings", "type"]:
            assert prop in item

        assert item["type"] in types,\
            """Kanji {} has unknown item type '{}'
            """.format(kanji, item["type"])

        assert item["type"] not in ["unprocessed"],\
            "Kanji {} is still unprocessed!".format(kanji)

        if item["type"] != "kokuji":
            assert len(item["readings"]) > 0,\
                "Kanji {} lacks readings!".format(kanji)

        if item["type"] == "comp_phonetic":
            assert "phonetic" in item,\
                """Kanji {} is marked as phonetic, but
                lacks the reference""".format(kanji)


def test_phonetic_entries_are_consistent():
    phonetic_db = phonetic_db_import()

    for phon, item in phonetic_db.items():
        for prop in ["readings",
                     "compounds",
                     "non_compounds",
                     "xrefs",
                     "wk-radical"]:
            assert prop in item

        assert len(item["readings"]) > 0,\
            "Tone mark '{}' has no readings!".format(phon)


def test_phonetic_compounds_are_kanji():
    kanji_db = kanji_db_import()
    phonetic_db = phonetic_db_import()

    for phon, item in phonetic_db.items():
        for comp in item["compounds"]:
            assert comp in kanji_db,\
                   """Kanji {} appears as compound of {},
                   but it was not found in the kanji_db!
                   """.format(comp, phon)


def test_phonetic_references_exist():
    kanji_db = kanji_db_import()
    phonetic_db = phonetic_db_import()

    for kanji, item in kanji_db.items():
        if "phonetic" in item:
            assert item["phonetic"] in phonetic_db,\
                   """Kanji {} lists {} as a tone mark,
                   but it is not in phonetic_db!
                   """.format(kanji, item["phonetic"])


def test_two_way_xrefs_of_phonetics():
    phonetic_db = phonetic_db_import()

    for phon, item in phonetic_db.items():
        for xref in item["xrefs"]:
            assert phon in phonetic_db[xref]["xrefs"],\
                   """Tone mark {} hass xref {},
                   but it is not mutual!
                   """.format(phon, xref)


def test_readings_are_hiragana():
    kanji_db = kanji_db_import()
    phonetic_db = phonetic_db_import()

    for db in [kanji_db, phonetic_db]:
        for kanji, item in db.items():
            for rdn in item["readings"]:
                assert not regex.sub("\p{Hiragana}", "", rdn),\
                    """Kanji {}, reading '{}' not in hiragana!
                    """.format(kanji, rdn)


def test_compound_appear_multiple_times():
    phonetic_db = phonetic_db_import()

    for phon, item in phonetic_db.items():
        for comp in item["compounds"]:
            assert item["compounds"].count(comp) == 1,\
                """Duplicate of comp {} for phon {}
                """.format(comp, phon)


def test_overlap_compounds_noncompounds():
    phonetic_db = phonetic_db_import()

    for phon, item in phonetic_db.items():
        for comp in item["compounds"]:
            assert comp not in item["non_compounds"],\
                """Kanji {} inconsistent compound for phon {}.
                """.format(comp, phon)


def test_wk_radical_coverage():
    phonetic_db = phonetic_db_import()
    wk_rad_db = wk_rad_db_import()

    wk_exceptions = ["易", "ト", "業", "禹", "ム", "ホ", "専", "両"]
    wk_exceptions2 = ["易", "専"]

    for phon, item in phonetic_db.items():
        cur_rad = item["wk-radical"]

        if cur_rad:
            cur_rad_char = wk_rad_db[cur_rad]["character"]

            if cur_rad_char and cur_rad_char not in wk_exceptions:
                assert cur_rad_char == phon,\
                    """Character of WK {} and phon {} don't match!
                    """.format(cur_rad_char, phon)
        else:
            for wk_rad, wk_item in wk_rad_db.items():
                if wk_item["character"] not in wk_exceptions2:
                    assert wk_item["character"] != phon,\
                        """Matching WK radical {} not mentioned in DB!
                        """.format(phon)
