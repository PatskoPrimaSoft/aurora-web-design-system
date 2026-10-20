# design-system/assets/fonts

**Inter Tight** (UI) и **JetBrains Mono** (цифры телеметрии) лежат здесь — шесть woff2, латиница и кириллица
в одном файле, лицензия SIL OFL 1.1 (`OFL.txt` в папке семейства). Собраны `tools/fonts/build_fonts.py` из
вариативных TTF Google Fonts; источники и контрольные суммы — `SOURCES.md`.

`dist/styles.css` пакета подключает их через `design-system/tokens/webfonts-selfhost.css`: интерфейс не ходит в Google Fonts.
Aurora ставится в инфраструктуру без выхода в интернет, а CDN-шрифт там тихо падает в Helvetica, на метриках
которой шкала размеров не выверена. Каталог также использует локальные файлы; дополнительные импорты не нужны.

Пересобрать: команды в шапке `tools/fonts/build_fonts.py`; `--verify` проверяет кириллицу и веса.

Иконочный шрифт **Material Symbols Outlined** (`design-system/fonts/MaterialSymbolsOutlined.woff2`, отдельная папка
верхнего уровня) — лицензия Apache License 2.0 (`design-system/fonts/LICENSE`), не SIL OFL, как у Inter Tight и
JetBrains Mono здесь.
