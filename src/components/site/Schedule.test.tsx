import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { INITIAL_SESSIONS } from "@/data/schedule";
import { Schedule } from "./Schedule";

describe("Schedule", () => {
  // Friday, Nov 20, 2026 (weekday index 4 -> Fri has Beach Conditioning & Strength Express)
  const friday = new Date(2026, 10, 20, 9, 0);

  it("defaults to today's weekday and displays real dates", () => {
    render(<Schedule sessions={INITIAL_SESSIONS} onBook={vi.fn()} referenceDate={friday} />);

    expect(screen.getByText("Beach Conditioning")).toBeInTheDocument();
    expect(screen.getByText("Strength Express")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("filters by place and focus, shows empty state, and resets filters", () => {
    render(<Schedule sessions={INITIAL_SESSIONS} onBook={vi.fn()} referenceDate={friday} />);

    fireEvent.click(screen.getByRole("button", { name: "Studio" }));
    expect(screen.queryByText("Beach Conditioning")).not.toBeInTheDocument();
    expect(screen.getByText("Strength Express")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mobility" }));
    expect(screen.getByText("No sessions match these filters.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getByText("Beach Conditioning")).toBeInTheDocument();
  });

  it("switches to Full week view and displays sessions across multiple days", () => {
    render(<Schedule sessions={INITIAL_SESSIONS} onBook={vi.fn()} referenceDate={friday} />);

    fireEvent.click(screen.getByRole("button", { name: "Full week" }));
    expect(screen.getByText("Sunday Long Session")).toBeInTheDocument();
    expect(screen.getByText("Hill Intervals")).toBeInTheDocument();
  });

  it("expands a session row to reveal description, meeting point, and equipment", () => {
    render(<Schedule sessions={INITIAL_SESSIONS} onBook={vi.fn()} referenceDate={friday} />);

    const trigger = screen.getByRole("button", { name: /Strength Express/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Meeting point")).toBeInTheDocument();
    expect(screen.getByText("Equipment provided")).toBeInTheDocument();
  });

  it("renders Join waitlist for full sessions and Booked/Cancel for booked ones", () => {
    const tuesday = new Date(2026, 10, 17, 9, 0); // Tue has Beach Conditioning (1 spot) & Barbell Strength (0 spots)
    const onWaitlist = vi.fn();
    const onCancel = vi.fn();
    const tueBeach = INITIAL_SESSIONS.find((s) => s.day === 1 && s.time === "07:00")!;

    render(
      <Schedule
        sessions={INITIAL_SESSIONS}
        onBook={vi.fn()}
        onWaitlist={onWaitlist}
        onCancel={onCancel}
        isBooked={(id) => id === tueBeach.id}
        referenceDate={tuesday}
      />,
    );

    const waitlistBtn = screen.getByRole("button", { name: "Join waitlist" });
    fireEvent.click(waitlistBtn);
    expect(onWaitlist).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Booked")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledWith(tueBeach);
  });
});
