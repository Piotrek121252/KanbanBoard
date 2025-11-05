const About = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-gray-200 pt-20">
      <div className="flex flex-col items-start max-w-3xl gap-6 text-gray-200">
        <h1 className="text-4xl font-bold">O aplikacji</h1>

        <p className="text-lg text-gray-300">
          <strong>TaskFlow</strong> to aplikacja webowa do zarządzania zadaniami
          z wykorzystaniem tablic Kanban. Umożliwia organizację pracy w
          zespołach oraz projektach indywidualnych, zapewniając przejrzysty
          podział zadań i nadzór nad procesem realizacji.
        </p>

        <h2 className="text-2xl font-semibold">Cel projektu</h2>
        <p className="text-gray-300">
          Projekt został stworzony w ramach pracy inżynierskiej. Jego celem było
          zaprojektowanie i implementacja nowoczesnego narzędzia wspierającego
          zespoły w pracy projektowej, z możliwością współpracy wielu
          użytkowników, możliwością dodawania użytkowników do tablic i
          zarządzania rolami.
        </p>

        <h2 className="text-2xl font-semibold">Najważniejsze funkcje</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>prywatne i publiczne tablice Kanban,</li>
          <li>możliwość zmiany układu tablicy kanban,</li>
          <li>
            możliwość edytowania zadań i przypisywania do nich użytkowników,
          </li>
          <li>drag and drop wspierający mysz i klawiaturę,</li>
          <li>
            współdzielenie pracy pomiędzy użytkownikami z podziałem na role.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold">Wykorzystane technologie</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>
            <strong>Frontend:</strong> React + TailwindCSS
          </li>
          <li>
            <strong>Backend:</strong> Spring Boot (REST API)
          </li>
          <li>
            <strong>Baza danych:</strong> PostgreSQL
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">Kontakt</h2>

        <div className="space-y-1 text-gray-300">
          <p>
            Email:{" "}
            <span className="text-gray-100 font-medium">
              264486@student.pwr.edu.pl
            </span>
          </p>
          <p>
            GitHub:{" "}
            <a
              href="https://github.com/Piotrek121252"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white"
            >
              github.com/Piotrek121252
            </a>
          </p>
        </div>

        <p className="text-xs text-gray-600 mt-10">
          © {new Date().getFullYear()} TaskFlow
        </p>
      </div>
    </div>
  );
};

export default About;
