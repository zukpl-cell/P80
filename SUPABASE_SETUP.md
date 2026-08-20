# Podłączenie Supabase — krok po kroku

## 1. Utwórz projekt

1. Wejdź na [supabase.com](https://supabase.com/) i zaloguj się.
2. Wybierz `New project`.
3. Nazwij projekt `P80`.
4. Ustaw silne hasło bazy i zapisz je w menedżerze haseł.
5. Wybierz region możliwie bliski Polsce i utwórz projekt.

Na ekranie bezpieczeństwa pozostaw `Enable Data API`, wyłącz `Automatically expose new tables` i włącz `Enable automatic RLS`. Skrypt nada później dostęp wyłącznie zalogowanemu użytkownikowi do konkretnej tabeli P80.

Nie przesyłaj nikomu hasła bazy, klucza `service_role` ani klucza OpenAI.

## 2. Utwórz tabelę i prywatny magazyn zdjęć

1. W panelu projektu otwórz `SQL Editor`.
2. Wybierz `New query`.
3. Wklej całą zawartość pliku `supabase/schema.sql`.
4. Kliknij `Run`.
5. W `Table Editor` powinna pojawić się tabela `daily_reports`.
6. W `Storage` powinien pojawić się prywatny bucket `report-photos`.

Plik SQL włącza Row Level Security. Każdy zalogowany użytkownik może widzieć wyłącznie własne raporty i zdjęcia.

## 3. Ustaw logowanie z GitHub Pages

1. Otwórz `Authentication → URL Configuration`.
2. Jako `Site URL` wpisz:

   `https://zukpl-cell.github.io/P80/`

3. Do `Redirect URLs` dodaj:

   `https://zukpl-cell.github.io/P80/`

4. Zapisz zmiany.

## 4. Uzupełnij publiczną konfigurację aplikacji

1. Otwórz `Project Settings → API`.
2. Skopiuj `Project URL`.
3. Skopiuj klucz `anon` albo `publishable` przeznaczony dla aplikacji klienckiej.
4. Otwórz `config.js` i zamień:

```js
supabaseUrl: "YOUR_SUPABASE_URL",
supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
```

Klucz anon/publishable może znajdować się w kodzie strony pod warunkiem poprawnego RLS. Nie używaj tutaj klucza `service_role`.

## 5. Wdróż funkcję analizy AI

Do tego kroku potrzebny jest Supabase CLI. Po instalacji wykonaj w katalogu aplikacji:

```bash
supabase login
supabase link --project-ref TWOJ_PROJECT_REF
supabase functions deploy analyze-report
supabase secrets set OPENAI_API_KEY=TWOJ_KLUCZ_OPENAI
supabase secrets set OPENAI_MODEL=gpt-5-mini
```

`TWOJ_PROJECT_REF` znajdziesz w adresie projektu lub `Project Settings`.

Klucz OpenAI utwórz na [platform.openai.com](https://platform.openai.com/). Rozliczenie API jest oddzielne od abonamentu ChatGPT. Ustaw niski miesięczny limit kosztów.

Nie wklejaj klucza OpenAI do `config.js`, repozytorium ani rozmowy. Wpisuje się go wyłącznie jako sekret Supabase.

## 6. Test końcowy

Po wdrożeniu aplikacji:

1. Otwórz `Ustawienia`.
2. Wpisz swój e-mail i wybierz `Wyślij link logowania`.
3. Otwórz link otrzymany pocztą.
4. Dodaj raport testowy i jedno zdjęcie.
5. Sprawdź w Supabase:
   - `Table Editor → daily_reports`,
   - `Storage → report-photos`.
6. Zamknij raport i sprawdź, czy pojawił się werdykt AI.

## Prywatność danych zdrowotnych

Raport zawiera dane dotyczące masy, glukozy, ketonów, treningu i bólu. Są one zapisywane w prywatnym projekcie Supabase. Treść zamykanego raportu jest wysyłana do OpenAI API w celu analizy; zdjęcia nie są obecnie wysyłane do modelu — pozostają w prywatnym Storage.
