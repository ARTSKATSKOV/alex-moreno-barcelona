import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider, useLanguage } from "./use-language";

function Probe() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="title">{t.schedule.title}</span>
      <button type="button" onClick={() => setLocale("es")}>
        Switch to ES
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        Switch to EN
      </button>
    </div>
  );
}

describe("useLanguage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("switches between EN and ES and persists to localStorage", () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    );

    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("title")).toHaveTextContent("Schedule");

    fireEvent.click(screen.getByRole("button", { name: "Switch to ES" }));
    expect(screen.getByTestId("locale")).toHaveTextContent("es");
    expect(screen.getByTestId("title")).toHaveTextContent("Horario");
    expect(window.localStorage.getItem("alex-moreno:locale")).toBe("es");

    fireEvent.click(screen.getByRole("button", { name: "Switch to EN" }));
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });
});
