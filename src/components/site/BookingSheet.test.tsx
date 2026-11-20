import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { INITIAL_SESSIONS } from "@/data/schedule";
import { BookingSheet } from "./BookingSheet";
import { MyBookingsSheet } from "./MyBookingsSheet";

describe("BookingSheet", () => {
  const openSession = INITIAL_SESSIONS.find((s) => s.spots > 0)!;
  const fullSession = INITIAL_SESSIONS.find((s) => s.spots === 0)!;

  it("validates name and email before confirming a booking", () => {
    const onConfirmBook = vi.fn(() => ({ ok: true as const }));
    render(
      <BookingSheet
        open={true}
        mode="book"
        session={openSession}
        onClose={vi.fn()}
        onConfirmBook={onConfirmBook}
        onConfirmWaitlist={vi.fn(() => ({ ok: true as const }))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please enter your name.");
    expect(onConfirmBook).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Laura" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(screen.getByRole("alert")).toHaveTextContent("valid email");
    expect(onConfirmBook).not.toHaveBeenCalled();
  });

  it("confirms a booking and shows .ics and Google Calendar actions", () => {
    const onConfirmBook = vi.fn(() => ({ ok: true as const }));
    render(
      <BookingSheet
        open={true}
        mode="book"
        session={openSession}
        onClose={vi.fn()}
        onConfirmBook={onConfirmBook}
        onConfirmWaitlist={vi.fn(() => ({ ok: true as const }))}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "  Laura  " } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "laura@bcn.dev" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp/), { target: { value: "+34 611 000 111" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));

    expect(onConfirmBook).toHaveBeenCalledWith(openSession.id, {
      name: "Laura",
      email: "laura@bcn.dev",
      phone: "+34 611 000 111",
    });
    expect(screen.getByText("You're booked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download \.ics/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Google Calendar/i })).toHaveAttribute(
      "href",
      expect.stringContaining("calendar.google.com"),
    );
  });

  it("handles waitlist mode and private 1:1 inquiry mode", () => {
    const onConfirmWaitlist = vi.fn(() => ({ ok: true as const }));
    const { rerender } = render(
      <BookingSheet
        open={true}
        mode="waitlist"
        session={fullSession}
        onClose={vi.fn()}
        onConfirmBook={vi.fn(() => ({ ok: true as const }))}
        onConfirmWaitlist={onConfirmWaitlist}
      />,
    );

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Tom" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "tom@bcn.dev" } });
    fireEvent.click(screen.getByRole("button", { name: "Join waitlist" }));
    expect(onConfirmWaitlist).toHaveBeenCalledTimes(1);
    expect(screen.getByText("You're on the waitlist")).toBeInTheDocument();

    const onConfirmInquiry = vi.fn();
    rerender(
      <BookingSheet
        open={true}
        mode="inquiry"
        session={null}
        onClose={vi.fn()}
        onConfirmBook={vi.fn(() => ({ ok: true as const }))}
        onConfirmWaitlist={onConfirmWaitlist}
        onConfirmInquiry={onConfirmInquiry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));
    expect(onConfirmInquiry).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Inquiry received")).toBeInTheDocument();
  });
});

describe("MyBookingsSheet", () => {
  it("lists booked and waitlisted sessions and triggers cancel/leave", () => {
    const bookedSession = INITIAL_SESSIONS[0]!;
    const waitSession = INITIAL_SESSIONS.find((s) => s.spots === 0)!;
    const onCancel = vi.fn();
    const onLeave = vi.fn();

    render(
      <MyBookingsSheet
        open={true}
        onClose={vi.fn()}
        sessions={INITIAL_SESSIONS}
        bookings={[
          {
            sessionId: bookedSession.id,
            bookedAt: new Date().toISOString(),
            name: "Laura",
            email: "laura@bcn.dev",
          },
        ]}
        waitlist={[
          {
            sessionId: waitSession.id,
            joinedAt: new Date().toISOString(),
            name: "Laura",
            email: "laura@bcn.dev",
          },
        ]}
        onCancelBooking={onCancel}
        onLeaveWaitlist={onLeave}
        onBrowseSchedule={vi.fn()}
      />,
    );

    expect(screen.getByText(bookedSession.name)).toBeInTheDocument();
    expect(screen.getByText(waitSession.name)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Cancel booking/i }));
    expect(onCancel).toHaveBeenCalledWith(bookedSession);

    fireEvent.click(screen.getByRole("button", { name: /Leave waitlist/i }));
    expect(onLeave).toHaveBeenCalledWith(waitSession);
  });
});
