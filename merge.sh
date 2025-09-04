#!/bin/bash

# Ten skrypt skanuje bieżący katalog oraz jego podkatalogi w poszukiwaniu
# plików .js i .css, a następnie łączy ich zawartość w dwa osobne pliki:
# marge.js i marge.css.
#
# Wykluczone katalogi: ./node_modules, ./build

# --- Konfiguracja ---
JS_OUTPUT_FILE="merge.js"
CSS_OUTPUT_FILE="merge.css"
EXCLUDE_DIRS=("./node_modules" "./build")

# --- Funkcja do budowania argumentów wykluczających dla komendy find ---
build_exclude_args() {
  local args=()
  # Buduje listę argumentów dla `find`, aby wykluczyć podane katalogi
  for dir in "${EXCLUDE_DIRS[@]}"; do
    if [ ${#args[@]} -ne 0 ]; then
      args+=(-o) # Dodaj operator OR, jeśli to nie jest pierwszy argument
    fi
    args+=(-path "$dir")
  done

  # Zwraca gotowy fragment komendy find
  if [ ${#args[@]} -gt 0 ]; then
    echo "\( ${args[@]} \) -prune"
  fi
}

# --- Główna logika ---

echo "Czyszczenie poprzednich plików..."
rm -f "$JS_OUTPUT_FILE" "$CSS_OUTPUT_FILE"

# Przygotowanie argumentów wykluczających. Używamy `eval` aby poprawnie
# zinterpretować cudzysłowy i nawiasy zwrócone przez funkcję.
EXCLUDE_ARGS=$(build_exclude_args)
if [ -n "$EXCLUDE_ARGS" ]; then
    FIND_CMD_PREFIX="find . $EXCLUDE_ARGS -o"
else
    FIND_CMD_PREFIX="find ."
fi


# --- Łączenie plików JavaScript ---
echo "Szukanie i łączenie plików .js..."
JS_FILES_FOUND=0
# Poprawiona pętla używająca "process substitution", aby uniknąć problemu z subshell'em.
# Dzięki temu zmienna JS_FILES_FOUND jest modyfikowana w bieżącej powłoce.
while IFS= read -r -d '' file; do
  # Dodajemy nagłówek z nazwą pliku do pliku wynikowego
  echo "// --- Początek pliku: $file ---" >> "$JS_OUTPUT_FILE"
  cat "$file" >> "$JS_OUTPUT_FILE"
  echo "" >> "$JS_OUTPUT_FILE"
  echo "// --- Koniec pliku: $file ---" >> "$JS_OUTPUT_FILE"
  echo "" >> "$JS_OUTPUT_FILE"
  JS_FILES_FOUND=$((JS_FILES_FOUND+1))
done < <(eval "$FIND_CMD_PREFIX -name '*.js' -print0")


if [ $JS_FILES_FOUND -gt 0 ]; then
  echo "Znaleziono i połączono $JS_FILES_FOUND plików JavaScript w $JS_OUTPUT_FILE"
else
  echo "Nie znaleziono żadnych plików .js do połączenia."
fi

echo "" # Pusta linia dla czytelności

# --- Łączenie plików CSS ---
echo "Szukanie i łączenie plików .css..."
CSS_FILES_FOUND=0
while IFS= read -r -d '' file; do
  # Dodajemy nagłówek z nazwą pliku do pliku wynikowego
  echo "/* --- Początek pliku: $file --- */" >> "$CSS_OUTPUT_FILE"
  cat "$file" >> "$CSS_OUTPUT_FILE"
  echo "" >> "$CSS_OUTPUT_FILE"
  echo "/* --- Koniec pliku: $file --- */" >> "$CSS_OUTPUT_FILE"
  echo "" >> "$CSS_OUTPUT_FILE"
  CSS_FILES_FOUND=$((CSS_FILES_FOUND+1))
done < <(eval "$FIND_CMD_PREFIX -name '*.css' -print0")

if [ $CSS_FILES_FOUND -gt 0 ]; then
  echo "Znaleziono i połączono $CSS_FILES_FOUND plików CSS w $CSS_OUTPUT_FILE"
else
  echo "Nie znaleziono żadnych plików .css do połączenia."
fi

echo ""
echo "Skrypt zakończył działanie."