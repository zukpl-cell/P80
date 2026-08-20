# Aktualizacja aplikacji na GitHub Pages

## Bezpieczna metoda z poziomu przeglądarki

1. Wejdź do repozytorium `zukpl-cell/P80`.
2. Pobierz dotychczasową wersję przez `Code → Download ZIP` i zachowaj jako kopię. Oryginalny plik jest też w przesłanym archiwum `P80-main.zip`.
3. W repozytorium wybierz `Add file → Upload files`.
4. Przeciągnij zawartość katalogu `P80-v2` — nie sam katalog nadrzędny.
5. Upewnij się, że w głównym katalogu repozytorium znajdą się:
   - `index.html`,
   - `styles.css`,
   - `app.js`,
   - `config.js`,
   - `manifest.webmanifest`,
   - `sw.js`,
   - katalog `icons`,
   - katalog `supabase`.
6. Commit message: `P80 V13 - nowa ikona aplikacji`.
7. Wybierz `Commit changes`.

GitHub Pages powinien wdrożyć zmianę automatycznie. Status sprawdzisz w `Actions` albo `Deployments → github-pages`.

## Po aktualizacji

1. Otwórz `https://zukpl-cell.github.io/P80/`.
2. Jeżeli nadal widzisz starą wersję, odśwież stronę bez cache lub zamknij aplikację z ekranu ostatnich aplikacji i uruchom ponownie.
3. Aby iPhone pokazał nową ikonę, usuń stary skrót P80 z ekranu początkowego, otwórz stronę w Safari i ponownie wybierz `Udostępnij → Do ekranu początkowego`.

## Cofnięcie zmiany

W repozytorium wejdź w `Commits`, otwórz poprzedni commit i użyj `Revert`. Nie usuwaj repozytorium ani historii commitów.
