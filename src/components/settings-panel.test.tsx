import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./settings-panel";

afterEach(() => vi.unstubAllGlobals());

function successfulResponse() {
  return {
    ok: true,
    json: async () => ({
      meta: { requestId: "req_test" },
      data: { id: "report-test", status: "received", message: "received" }
    })
  } as Response;
}

describe("SettingsPanel problem reporting", () => {
  it("submits a report without diagnostics unless the user opts in", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => successfulResponse());
    vi.stubGlobal("fetch", fetcher);
    render(<SettingsPanel currentSection="Quran" />);

    fireEvent.change(screen.getByLabelText("Describe the problem"), {
      target: { value: "The Quran section does not load on my device." }
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit report/ }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("/api/v1/problem-reports");
    const payload = JSON.parse(String(init?.body));
    expect(payload.category).toBe("bug");
    expect(payload.currentSection).toBe("Quran");
    expect(payload).not.toHaveProperty("diagnostics");
    expect(screen.getByRole("status")).toHaveTextContent("Your report has been received.");
  });

  it("requires both Surah and Ayah numbers for a Quran-specific report", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => successfulResponse());
    vi.stubGlobal("fetch", fetcher);
    render(<SettingsPanel currentSection="Quran" />);

    fireEvent.change(screen.getByLabelText("Problem type"), { target: { value: "quran" } });
    fireEvent.change(screen.getByLabelText("Describe the problem"), {
      target: { value: "This report refers to one specific Quran Ayah." }
    });
    fireEvent.change(screen.getByLabelText("Surah number (optional)"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit report/ }));

    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Enter both the Surah number and Ayah number");
  });

  it("sends diagnostics only after explicit consent", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => successfulResponse());
    vi.stubGlobal("fetch", fetcher);
    render(<SettingsPanel currentSection="Settings" />);

    fireEvent.change(screen.getByLabelText("Describe the problem"), {
      target: { value: "The settings page is not saving my preference." }
    });
    fireEvent.click(screen.getByLabelText(/Include browser and device diagnostics/));
    fireEvent.click(screen.getByRole("button", { name: /Submit report/ }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const [, init] = fetcher.mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.diagnostics).toContain("userAgent");
    expect(payload.diagnostics).toContain("language");
  });

  it("does not send stale Ayah coordinates after changing the report category", async () => {
    const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => successfulResponse());
    vi.stubGlobal("fetch", fetcher);
    render(<SettingsPanel currentSection="Quran" />);

    fireEvent.change(screen.getByLabelText("Problem type"), { target: { value: "quran" } });
    fireEvent.change(screen.getByLabelText("Surah number (optional)"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Ayah number (optional)"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Problem type"), { target: { value: "bug" } });
    fireEvent.change(screen.getByLabelText("Describe the problem"), {
      target: { value: "The Settings page is not opening after I tap it." }
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit report/ }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const [, init] = fetcher.mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload).not.toHaveProperty("surahNumber");
    expect(payload).not.toHaveProperty("ayahNumber");
  });
});
