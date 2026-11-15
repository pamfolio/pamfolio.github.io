#!/usr/bin/env python3
"""Build a standalone static site from Pages CMS JSON. Uses Python standard library only.

Run from any directory: python3 scripts/build.py
Output: _site/ (never changes the input site or content files).
"""
from __future__ import annotations
import hashlib
import html
import json
from pathlib import Path
import re
import shutil
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_site'

def load(name: str) -> dict:
    obj = json.loads((ROOT / 'content' / name).read_text(encoding='utf-8'))
    if not isinstance(obj, dict):
        raise ValueError(f'{name}: expected a JSON object.')
    return obj

def dumps(obj: object) -> str:
    # Keep JS string literals safe, including old engines' Unicode line separators.
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')

def checked_rows(obj: dict, key: str, label: str) -> list[dict]:
    rows = obj.get(key)
    if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
        raise ValueError(f'{label}: {key} must be an array of objects.')
    seen: set[str] = set()
    for row in rows:
        identity = row.get('id', '')
        if not isinstance(identity, str) or not re.fullmatch(r'[a-zA-Z0-9_-]+', identity):
            raise ValueError(f'{label}: every item needs an English/numeric ID. Check {row.get("name", "unnamed item")}.')
        if identity in seen:
            raise ValueError(f'{label}: duplicate ID {identity}.')
        seen.add(identity)
        if not isinstance(row.get('name'), str) or not row['name'].strip():
            raise ValueError(f'{label}: {identity} needs a name.')
    return rows

def check_media(value: object, label: str) -> None:
    if value in ('', None):
        return
    if not isinstance(value, str):
        raise ValueError(f'{label}: image must be a path or HTTPS URL.')
    url = urlsplit(value)
    if url.scheme == 'https' and url.netloc:
        return
    decoded = unquote(url.path)
    if url.scheme or url.netloc or not decoded.startswith('assets/') or '\\' in decoded:
        raise ValueError(f'{label}: use an assets/... path or HTTPS image URL.')
    p = (ROOT / decoded).resolve()
    if not p.is_relative_to((ROOT / 'assets').resolve()) or not p.is_file():
        raise ValueError(f'{label}: missing or invalid local image: {value}')

def check_source_urls(obj: object, path: str = 'content') -> None:
    if isinstance(obj, dict):
        for key, value in obj.items():
            if key in {'url', 'source', 'sourceUrl', 'historySourceUrl'} and isinstance(value, str) and value:
                u = urlsplit(value)
                if u.scheme != 'https' or not u.netloc:
                    raise ValueError(f'{path}.{key}: source links must be HTTPS.')
            check_source_urls(value, f'{path}.{key}')
    elif isinstance(obj, list):
        for i, value in enumerate(obj):
            check_source_urls(value, f'{path}[{i}]')

def replace_once(text: str, old: str, new: str, label: str) -> str:
    if text.count(old) != 1:
        raise ValueError(f'Build template mismatch: {label}. The input source structure changed.')
    return text.replace(old, new, 1)

def element_text(page: str, attr: str, value: str, text: str) -> str:
    # These source elements contain text only. Preserve their outer markup exactly.
    pat = re.compile(r'(<([a-zA-Z][\w:-]*)\b[^>]*\b' + re.escape(attr) + r'="' + re.escape(value) + r'"[^>]*>)(.*?)(</\2>)', re.S)
    def repl(m: re.Match) -> str:
        return m.group(1) + html.escape(str(text)) + m.group(4)
    result, count = pat.subn(repl, page)
    if count != 1:
        raise ValueError(f'Missing/duplicate homepage text target: {attr}={value}.')
    return result

def image_attributes(page: str, id_: str, src: str, alt: str) -> str:
    pat = re.compile(r'<img\b[^>]*\bid="' + re.escape(id_) + r'"[^>]*>')
    def repl(m: re.Match) -> str:
        tag = m.group()
        for key, value in [('src', src), ('alt', alt)]:
            tag, n = re.subn(r'\b' + key + r'="[^"]*"', lambda _: key + '="' + html.escape(value, quote=True) + '"', tag)
            if n != 1:
                raise ValueError(f'Missing {key} on {id_}.')
        return tag
    result, n = pat.subn(repl, page)
    if n != 1:
        raise ValueError(f'Missing image target: {id_}.')
    return result

def main() -> None:
    site = load('site.json')
    foods = checked_rows(load('foods.json'), 'items', 'Foods')
    restaurants = checked_rows(load('restaurants.json'), 'items', 'Restaurants')
    sights = load('sights.json')
    sight_rows = checked_rows(sights, 'sights', 'Sights')
    seafood = load('seafood.json')
    area = load('area.json')
    history = load('food-history.json')
    nutrition = load('nutrition.json')
    for f in foods:
        f.setdefault('tastes', [])
        if not isinstance(f['tastes'], list) or any(not isinstance(x, str) for x in f['tastes']):
            raise ValueError(f'Foods {f["id"]}: tastes must be a list of strings.')
        for key in ['region', 'origin', 'category', 'taste', 'desc', 'story', 'shop', 'address', 'hours', 'notes', 'art', 'image', 'photoUrl']:
            f.setdefault(key, '')
        f.setdefault('duration', 30)
        check_media(f.get('photoUrl'), 'Foods '+f['id'])
    for r in restaurants:
        if not re.fullmatch(r'restaurant-[a-z0-9-]{8,80}', r['id']):
            raise ValueError('Restaurant IDs must start with restaurant- followed by at least 8 lowercase letters/numbers/hyphens.')
        check_media(r.get('photoUrl'), 'Restaurants '+r['id'])
    for s in sight_rows:
        s.setdefault('categories', [])
        check_media(s.get('image'), 'Sights '+s['id'])
    for key in ['mainImage', 'smallImage']:
        check_media(site.get(key), 'Homepage '+key)
    for obj in [foods, restaurants, sights, seafood, history]:
        check_source_urls(obj)
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for p in ROOT.iterdir():
        if p.is_file() and p.suffix in {'.html', '.css', '.js'}:
            shutil.copy2(p, OUT / p.name)
    shutil.copytree(ROOT / 'assets', OUT / 'assets', ignore=shutil.ignore_patterns('.gitkeep', '.DS_Store'))
    (OUT / '.nojekyll').write_text('', encoding='utf-8')
    app = (ROOT / 'app.js').read_text(encoding='utf-8')
    begin, end = app.index('const FOODS=['), app.index('const allFoods=')
    app = app[:begin] + 'const FOODS=' + dumps(foods) + ';\n' + app[end:]
    (OUT / 'app.js').write_text(app, encoding='utf-8')
    restaurant_js = (ROOT / 'restaurants.js').read_text(encoding='utf-8')
    restaurant_js = replace_once(restaurant_js, 'Object.freeze([])', 'Object.freeze('+dumps(restaurants)+')', 'restaurants')
    (OUT / 'restaurants.js').write_text(restaurant_js, encoding='utf-8')
    for filename, var, obj in [('sights-data.js','SIGHTS_DATA',sights),('seafood-calendar-data.js','SEAFOOD_CALENDAR_DATA',seafood),('history-data.js','FOOD_HISTORY',history),('nutrition-data.js','FOOD_NUTRITION',nutrition)]:
        (OUT / filename).write_text("'use strict';\nwindow."+var+' = '+dumps(obj)+';\n',encoding='utf-8')
    area_js = (ROOT / 'area-guide.js').read_text(encoding='utf-8')
    begin, end = area_js.index('const AREA_GUIDE_DEFAULTS='), area_js.index('function ')
    area_js = area_js[:begin] + 'const AREA_GUIDE_DEFAULTS=' + dumps(area) + ';\n' + area_js[end:]
    (OUT / 'area-guide.js').write_text(area_js, encoding='utf-8')
    # Uploaded filenames can contain Chinese characters. Keep paths within assets/.
    sight_js = (ROOT / 'sights.js').read_text(encoding='utf-8')
    old = "return typeof value==='string'&&/^assets\\/[a-zA-Z0-9_./-]+$/.test(value)?value:sightSafeUrl(value);"
    new = """if(typeof value!=='string')return '';
 try{if(value.startsWith('assets/')){const base=new URL('assets/',location.href),url=new URL(value,location.href);if(url.origin===base.origin&&url.pathname.startsWith(base.pathname))return url.href;}}catch{}
 return sightSafeUrl(value);"""
    sight_js = replace_once(sight_js, old, new, 'sight image handling')
    (OUT / 'sights.js').write_text(sight_js, encoding='utf-8')
    page = (ROOT / 'index.html').read_text(encoding='utf-8')
    page, n = re.subn(r'<title>.*?</title>', lambda _: '<title>'+html.escape(site['title'])+'</title>', page, count=1)
    if n != 1: raise ValueError('Missing title tag.')
    page, n = re.subn(r'<meta name="description" content="[^"]*">', lambda _: '<meta name="description" content="'+html.escape(site['description'], quote=True)+'">', page, count=1)
    if n != 1: raise ValueError('Missing description meta tag.')
    for key, value in site['hero'].items():
        page = element_text(page, 'data-hero-copy', key, value)
    for key, id_ in [('mainCaption','hero-main-caption'),('mainSubtitle','hero-main-subtitle'),('smallCaption','hero-small-caption')]:
        page = element_text(page, 'id', id_, site[key])
    for key, id_ in [('mainImage','hero-main-image'),('smallImage','hero-small-image')]:
        page = image_attributes(page, id_, site[key], site.get(key+'Alt',''))
    # Each build links to content-hashed assets, avoiding old browser-cached scripts.
    def versioned(m: re.Match) -> str:
        attr, url = m.group(1), m.group(2)
        path = url.split('?', 1)[0]
        p = OUT / path
        if p.is_file() and p.suffix in {'.js','.css'}:
            url = path + '?v=' + hashlib.sha256(p.read_bytes()).hexdigest()[:12]
        return attr+'="'+url+'"'
    page = re.sub(r'\b(src|href)="([^"#]+)"', versioned, page)
    (OUT / 'index.html').write_text(page, encoding='utf-8')
    print(f'Build OK: {len(foods)} foods, {len(restaurants)} restaurants, {len(sight_rows)} sights.')
    print(f'Output: {OUT}')

if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError, json.JSONDecodeError) as exc:
        raise SystemExit('Build stopped; no deployment should proceed. '+str(exc)) from exc
