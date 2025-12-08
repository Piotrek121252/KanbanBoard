# TaskFlow

---

Aplikacja webowa wspomagająca zarządzanie projektami informatycznymi oparta o tablice Kanban. Umożliwia organizację zadań, śledzenie postępu, logowanie czasu pracy oraz wyświetlenie miesięcznych podsumowań.

### Kluczowe funkcje

---

- Rejestracja i logowanie użytkowników z wykorzystaniem JWT
- Tworzenie tablic (projektów) i zarządzanie ich zawartością
- Dodawanie, edytowanie i usuwanie kolumn oraz zadań
- Przypisywanie użytkowników do zadań oraz dodawanie komentarzy
- Przenoszenie zadań metodą drag & drop z obsługą myszy i klawiatury
- Nadawanie ról członkom tablic i zarządzanie ich uprawnieniami
- Oznaczanie tablic jako ulubione
- Logowanie czasu pracy w zadaniach z rozróżnieniem typów pracy
- Generowanie miesięcznych podsumowań czasu pracy dla projektu
- Współpraca użytkowników w tablicach prywatnych i publicznych

### Wykorzystane technologie

---

#### **Frontend**

- React
- TailwindCSS
- React Router
- Axios
- dnd-kit

#### **Backend**

- Java 17
- Spring Boot 3.5.7
- Spring Data JPA + Hibernate
- Maven
- Docker
- PostgreSQL

### Projekt Strony

---

Strona Główna
![Strona Główna](./images/Homepage_logged_in.png)

Lista dostępnych tablic
![Lista dostępnych tablic](./images/Boards_page.png)

Lista użytkowników
![Lista użytkowników](./images/Member_list.png)

Tablica Kanban
![Main kanban board](./images/Kanban_Board_moving_task.png)

Szczegółowe informacje o zadaniu
![Detailed task info](./images/Task_preview.png)

Komentarze pod zadaniem
![Komentarze](./images/Comments_Task.png)

Dodawanie wpisów czasu pracy
![Wpisy czasu pracy](./images/Rejestracja_czasu.png)

Edycja kolumny
![Edycja kolumny](./images/Column_edit.png)
Edycja zadania
![Edycja zadania](./images/Task_edit.png)
Podsumowanie czasu pracy
![Podsumowanie czasu pracy](./images/Podsumowanie_czasu_pracy.png)

Aplikacja stworzona przez: Piotr Komarnicki
