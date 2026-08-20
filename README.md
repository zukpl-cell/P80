# P80 V2

Mobilna aplikacja do pełnego raportowania Projektu 80 kg.

## Co działa

- codzienny raport: masa z dokładnością po przecinku, glukoza, ketony, jedzenie, napoje, ruch, sen i keto;
- szkic dnia zachowujący poranne pomiary i późniejsze uzupełnienia;
- wiele pozycji jedzenia i napojów z gramaturą, kaloriami i zdjęciem;
- kalkulator z 51 produktami keto podzielonymi na kategorie;
- własne produkty z etykiety zapisywane lokalnie i synchronizowane z kontem;
- twardy werdykt `DOWIEZIONE` / `NIEDOWIEZIONE`;
- kalorie poniżej dolnego zakresu są ostrzeżeniem, a nie automatycznym niedowiezieniem;
- uzasadniony dzień regeneracyjny zwalnia z planu ruchowego po podaniu powodu;
- dzisiejszy raport można otworzyć, poprawić i ponownie przeliczyć;
- raport pozostaje otwarty do 23:59, a o północy niezakończony dzień jest automatycznie oznaczany jako `NIEDOWIEZIONE`;
- historia uwzględnia pierwszy dzień projektu — 20.08.2026 — również przy uruchomieniu aplikacji następnego dnia;
- historia, wykres masy, seria dowiezionych dni i eksport JSON;
- ekran startowy z symetrycznym trendem zmiany masy względem zera oraz wykresami glukozy i ketonów;
- mobilny układ i instalacja jako PWA;
- tryb lokalny bez konfiguracji;
- prywatna synchronizacja, zdjęcia i werdykt AI po podłączeniu Supabase.

## Uruchomienie testowe

Otwórz katalog przez lokalny serwer HTTP, na przykład:

```bash
python -m http.server 8080
```

Następnie przejdź do `http://localhost:8080`.

Bez Supabase aplikacja działa w trybie lokalnym i zapisuje raporty w przeglądarce. Zdjęcia lokalne mają ograniczoną pojemność; wersja docelowa używa prywatnego Storage.

## Wdrożenie docelowe

1. Wykonaj instrukcję [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
2. Przetestuj logowanie, zapis i zdjęcia.
3. Wgraj pliki do głównego katalogu repozytorium `zukpl-cell/P80` zgodnie z [GITHUB_UPDATE.md](GITHUB_UPDATE.md).

## Bezpieczeństwo

- `config.js` zawiera wyłącznie publiczny adres projektu i klucz anon/publishable chroniony przez RLS.
- `OPENAI_API_KEY` jest sekretem funkcji serwerowej i nigdy nie może trafić do `config.js`, GitHuba ani kodu przeglądarki.
- bucket `report-photos` jest prywatny, a dostęp do ścieżek ogranicza identyfikator zalogowanego użytkownika.
- aplikacja nie diagnozuje medycznie i nie zastępuje lekarza ani fizjoterapeuty.

## Najważniejsze pliki

- `index.html` — interfejs;
- `styles.css` — wygląd mobilny;
- `app.js` — raporty, werdykty, synchronizacja i PWA;
- `config.js` — parametry projektu oraz publiczna konfiguracja Supabase;
- `supabase/schema.sql` — tabela, RLS i prywatny bucket zdjęć;
- `supabase/functions/analyze-report/index.ts` — serwerowa analiza AI.
