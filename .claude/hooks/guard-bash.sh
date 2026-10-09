#!/usr/bin/env bash
# PreToolUse-хук Claude Code для инструмента Bash.
# Не даёт агенту публиковать пакет и выпускать версии: релиз — push в master, пакет и тег v<version> публикует CI
# (.github/workflows/ci.yml), push делает человек (см. AGENTS.md).
#
# Вход: JSON от Claude Code на stdin, команда лежит в .tool_input.command.
# Выход: exit 2 + текст в stderr — вызов заблокирован; exit 0 — разрешён.
# jq на машине может отсутствовать, поэтому проверяем по сырому JSON.

input=$(cat)

has() { printf '%s' "$input" | grep -Eq "$1"; }

blocked=""
if has '(^|[^[:alnum:]_./-])npm[[:space:]]+publish([[:space:]]|\\?"|$)'; then
    blocked="npm publish"
elif has 'git[[:space:]]+push[^"]*([[:space:]]|:)(master|--tags|--follow-tags|v[0-9]+(\.[0-9]+)+)([[:space:]]|"|$)'; then
    blocked="git push в master или тега версии"
elif has 'git[[:space:]]+tag[[:space:]]+(-a[[:space:]]+|-s[[:space:]]+)?v[0-9]'; then
    blocked="git tag v*"
elif has 'npm[[:space:]]+version' && ! has 'npm[[:space:]]+version[^"]*--no-git-tag-version'; then
    blocked="npm version с тегом"
fi

if [ -n "$blocked" ]; then
    cat >&2 <<EOF
Заблокировано хуком .claude/hooks/guard-bash.sh: «$blocked».
Релиз — push в master, пакет и тег v<version> публикует CI (.github/workflows/ci.yml). Push делает человек,
версию переводит /aurora-release (npm version <X.Y.Z> --no-git-tag-version). См. AGENTS.md.
Если это нужно прямо сейчас, пользователь может выполнить команду сам: «! <команда>».
EOF
    exit 2
fi

exit 0
