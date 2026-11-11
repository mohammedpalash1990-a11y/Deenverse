import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuranBetaReader } from "./quran-beta-reader";

afterEach(() => vi.unstubAllGlobals());

describe("QuranBetaReader publication gate", () => {
  it("does not fetch, link, or render Quran/audio content while source approval is pending", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);

    render(<QuranBetaReader />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "কুরআনের আরবি পাঠ, বাংলা অনুবাদ ও অডিও এখনো প্রকাশের জন্য অনুমোদিত নয়।"
    );
    expect(screen.getByText(/SHA-256/)).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    expect(document.querySelector("audio")).toBeNull();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
