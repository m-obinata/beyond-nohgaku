# -*- coding: utf-8 -*-
"""import_author_audit — 作者監査Excel → data/editorial/authors.json

作者情報の訂正（the能ドットコム等で確認）を編集オーバーライドとして取り込む。
build-public-data がこれを読み、公開データの作者を上書きする。

  実行: python scripts/noh-db/import_author_audit.py

原本は private-data/noh/noh_play_author_audit_v0_1.xlsx（.gitignore・非公開）。
出力 authors.json は公開する（作者と出典の事実データ）。
"""
import io, json, re, sys
from pathlib import Path
from datetime import datetime, timezone

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
import openpyxl

ROOT = Path(__file__).resolve().parents[2]
XL = ROOT / "private-data" / "noh" / "noh_play_author_audit_v0_1.xlsx"
OUT = ROOT / "data" / "editorial" / "authors.json"

# attribution_status → 4状態（サイト共通）
STATE = {
    "確認済": "known",
    "異説あり": "known",          # 主たる作者はあるが異説を伴う
    "複合作者情報": "known",       # 作・改作など複数の関与
    "不詳": "unknown",
    "要追加文献確認": "needs_review",
}

# 正規の作者名（同定用）。上から順に、生の表記に現れた最初の作者を主たる作者とする。
FIGURES = [
    (r"世阿弥|世阿彌|世阿弥元清", "世阿弥"),
    (r"観阿弥|觀阿彌", "観阿弥"),
    (r"観世(?:小次郎)?信光", "観世信光"),
    (r"観世(?:弥次郎)?長俊", "観世長俊"),
    (r"観世(?:十郎)?元雅|(?<!長)元雅", "観世元雅"),
    (r"金春禅鳳|禅鳳", "金春禅鳳"),
    (r"金春禅竹|禅竹", "金春禅竹"),
    (r"金春信高", "金春信高"),
    (r"宮増", "宮増"),
    (r"榎並左衛門", "榎並左衛門"),
    (r"土岐善麿", "土岐善麿"),
    (r"日吉[左佐]阿弥", "日吉左阿弥"),
    (r"井阿弥", "井阿弥"),
    (r"喜阿弥", "喜阿弥"),
    (r"金剛長頼", "金剛長頼"),
    (r"竹田(?:法印)?定盛", "竹田定盛"),
    (r"内藤左衛門", "内藤左衛門"),
]
FIGURE_RE = [(re.compile(p), name) for p, name in FIGURES]
UNCERTAIN = re.compile(r"一説|[？?]|改作|補訂|原作|可能性|か$|説$")


def identify_author(raw):
    """生の author_display から、主たる作者を正規名で同定する。
    返り値 (author 正規名 or None, uncertain 真偽)。"""
    if raw is None:
        return None, False
    s = str(raw).strip()
    if s == "" or s.startswith("不明") or s.startswith("未確認") or s in ("不詳", "-", "ー", "―", "—"):
        return None, False
    # 文字列に最初に現れる作者を主とする
    best, best_pos = None, 10 ** 9
    for rgx, name in FIGURE_RE:
        m = rgx.search(s)
        if m and m.start() < best_pos:
            best, best_pos = name, m.start()
    uncertain = bool(UNCERTAIN.search(s))
    return best, uncertain


def main():
    if not XL.exists():
        sys.stderr.write("✗ 監査Excelが見つかりません: %s\n" % XL)
        sys.exit(1)
    wb = openpyxl.load_workbook(XL, read_only=True, data_only=True)
    ws = wb["AUTHOR"]
    rows = list(ws.iter_rows(values_only=True))
    # ヘッダー行を探す
    hdr_i = next(i for i, r in enumerate(rows) if r and "author_record_id" in [str(c) for c in r if c])
    hdr = [str(c) if c is not None else "" for c in rows[hdr_i]]
    data = [dict(zip(hdr, r)) for r in rows[hdr_i + 1:] if r and r[1]]

    out = {}
    seen_authors = {}
    for d in data:
        pid = str(d["play_id"]).strip()
        raw = d.get("author_display")
        status = (str(d.get("attribution_status")).strip() if d.get("attribution_status") else None)
        author, uncertain = identify_author(raw)
        state = STATE.get(status, "needs_review")
        if author is None:
            state = "unknown" if status in ("不詳", None) else STATE.get(status, "needs_review")
        url = d.get("source_url")
        out[pid] = {
            "author": author,               # 正規化した主たる作者（表示・軸に使う）
            "uncertain": uncertain,          # 一説・？・改作 などの注記があるか
            "raw": (str(raw).strip() if raw is not None else None),  # 生の表記（参照用）
            "status": status,
            "state": state,
            "relation": (str(d.get("author_relation")).strip() if d.get("author_relation") else None),
            "sourceUrl": (str(url).strip() if url else None),
        }
        if author:
            seen_authors[author] = seen_authors.get(author, 0) + 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    io.open(OUT, "w", encoding="utf-8").write(json.dumps({
        "_doc": "作者監査（the能ドットコム等で確認）。play_id→作者・確認状態・出典。build-public-data が公開データの作者を上書きする。人手管理。",
        "version": "0.1",
        "checkedAt": "2026-09-26",
        "sourceVersion": "noh_play_author_audit_v0_1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "map": out,
    }, ensure_ascii=False, indent=2) + "\n")

    named = sum(1 for v in out.values() if v["author"])
    print("✓ authors.json: %d 曲（作者判明 %d）" % (len(out), named))
    print("  整形後の作者（頻度順）:")
    for a, n in sorted(seen_authors.items(), key=lambda x: -x[1]):
        print("    %2d  %s" % (n, a))


if __name__ == "__main__":
    main()
