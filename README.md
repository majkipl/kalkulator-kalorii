# Koci Dziennik Zdrowia

Kompleksowa, responsywna aplikacja do monitorowania zdrowia, diety i historii Twojego kota, zbudowana przy użyciu **React** oraz **Tailwind CSS**.

## Opis

Koci Dziennik Zdrowia to zaawansowane narzędzie stworzone z myślą o świadomych opiekunach kotów. Aplikacja pozwala nie tylko na precyzyjne obliczenie dziennego zapotrzebowania kalorycznego, ale również na prowadzenie szczegółowego dziennika zdrowia i rozwoju Twojego pupila.

Głównym celem aplikacji jest zebranie wszystkich kluczowych informacji o kocie w jednym, łatwo dostępnym miejscu, co ułatwia dbanie o jego dobrostan i wspiera podczas wizyt weterynaryjnych.

## Główne Funkcjonalności

Aplikacja składa się z kilku modułów, które razem tworzą kompletny system do zarządzania zdrowiem kota:

### 1\. Kalkulator Kalorii

* **Precyzyjne Obliczenia:** Automatycznie oblicza dzienne zapotrzebowanie kaloryczne na podstawie wagi kota oraz jego poziomu aktywności (uwzględniając sterylizację).
* **Wsparcie w Diecie:** Pomaga w utrzymaniu prawidłowej wagi i zapobiega otyłości lub niedowadze.

### 2\. Historia Wagi

* **Monitorowanie Zmian:** Umożliwia regularne zapisywanie wagi kota i śledzenie jej zmian na przestrzeni czasu.
* **Wykresy (w planach):** Wizualizacja danych w postaci wykresów, aby łatwiej zauważyć tendencje wzrostowe lub spadkowe.

### 3\. Dziennik Zdrowia

Kompleksowy moduł do notowania wszystkich ważnych wydarzeń zdrowotnych:

* **Obserwacje:** Miejsce na zapisywanie codziennych spostrzeżeń dotyczących zachowania, apetytu czy samopoczucia kota.
* **Wizyty u Weterynarza:** Rejestrowanie dat wizyt, diagnoz, zaleceń lekarskich oraz przepisanych leków.
* **Szczepienia:** Prowadzenie ewidencji wykonanych szczepień, wraz z datami i rodzajem szczepionki.
* **Odrobaczanie:** Notowanie terminów i zastosowanych preparatów przeciw pasożytom.

## Technologie

* [**React**](https://reactjs.org/) - Biblioteka JavaScript do budowania dynamicznych i interaktywnych interfejsów użytkownika.
* [**Tailwind CSS**](https://tailwindcss.com/) - Nowoczesny framework CSS, który pozwala na szybkie i elastyczne stylowanie komponentów.

## Użycie

Aplikacja jest intuicyjna w obsłudze. Po uruchomieniu możesz swobodnie przełączać się między modułami, aby obliczyć kalorie, dodać nowy wpis do dziennika zdrowia czy zaktualizować wagę swojego kota.

## Instalacja i uruchomienie lokalne

1.  Sklonuj repozytorium na swój dysk:
    ```bash
    git clone https://github.com/majkipl/kalkulator-kalorii.git
    ```
2.  Przejdź do katalogu głównego projektu:
    ```bash
    cd kalkulator-kalorii
    ```
3.  Zainstaluj wszystkie wymagane zależności:
    ```bash
    npm install
    ```
4.  Uruchom aplikację w trybie deweloperskim:
    ```bash
    npm start
    ```

Aplikacja zostanie uruchomiona i będzie dostępna w przeglądarce pod adresem `http://localhost:3000`.