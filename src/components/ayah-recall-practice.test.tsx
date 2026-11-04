import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AyahRecallPractice } from './ayah-recall-practice';

// Synthetic exact strings only; never substitute generated scripture in fixtures.
const text = '  SYNTHETIC_NON_QURAN\nunchanged  ';

function renderPractice() {
  return render(
    <AyahRecallPractice textArabic={text}>
      <p lang="bn">SYNTHETIC_TRANSLATION</p>
      <details><summary>Synthetic notes</summary>SYNTHETIC_FOOTNOTE</details>
    </AyahRecallPractice>
  );
}

describe('Ayah self-guided recall practice', () => {
  it('starts in ordinary reading mode with exact text and explicit limitations', () => {
    renderPractice();
    const arabic = screen.getByText('SYNTHETIC_NON_QURAN unchanged');
    expect(arabic.textContent).toBe(text);
    expect(arabic).toHaveAttribute('lang', 'ar');
    expect(arabic).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('button', { name: 'Start Hifz practice' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('button', { name: 'Exit practice' })).not.toBeInTheDocument();
    expect(screen.getByText(/no recording, automated grading, or saved progress/)).toBeInTheDocument();
  });

  it('removes both Arabic and translation/footnotes from the DOM during recall', () => {
    const { container } = renderPractice();
    const button = screen.getByRole('button', { name: 'Start Hifz practice' });
    fireEvent.click(button);
    expect(button).toHaveAccessibleName('Reveal Ayah');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(button.getAttribute('aria-controls')!)).toBeInTheDocument();
    for (const marker of ['SYNTHETIC_NON_QURAN', 'SYNTHETIC_TRANSLATION', 'SYNTHETIC_FOOTNOTE']) {
      expect(container.textContent).not.toContain(marker);
    }
    expect(screen.getByRole('status')).toHaveTextContent('Ayah and translation hidden');
  });

  it('reveals unchanged content and supports repeated recall without network/storage', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    try {
      renderPractice();
      fireEvent.click(screen.getByRole('button', { name: 'Start Hifz practice' }));
      for (let attempt = 0; attempt < 3; attempt++) {
        fireEvent.click(screen.getByRole('button', { name: 'Reveal Ayah' }));
        expect(screen.getByText('SYNTHETIC_NON_QURAN unchanged').textContent).toBe(text);
        expect(screen.getByText('SYNTHETIC_TRANSLATION')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Ayah revealed');
        fireEvent.click(screen.getByRole('button', { name: 'Hide Ayah again' }));
      }
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(storageSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
      storageSpy.mockRestore();
    }
  });

  it.each(['recall', 'revealed'])('exits %s mode and restores focus to the stable primary button', (mode) => {
    renderPractice();
    const primary = screen.getByRole('button', { name: 'Start Hifz practice' });
    fireEvent.click(primary);
    if (mode === 'revealed') fireEvent.click(primary);
    const exit = screen.getByRole('button', { name: 'Exit practice' });
    exit.focus();
    fireEvent.click(exit);
    expect(primary).toHaveFocus();
    expect(primary).toHaveAccessibleName('Start Hifz practice');
    expect(primary).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('SYNTHETIC_NON_QURAN unchanged').textContent).toBe(text);
  });

  it('does not persist practice mode across remounts', () => {
    const first = renderPractice();
    fireEvent.click(screen.getByRole('button', { name: 'Start Hifz practice' }));
    first.unmount();
    renderPractice();
    expect(screen.getByRole('button', { name: 'Start Hifz practice' })).toBeInTheDocument();
    expect(screen.getByText('SYNTHETIC_NON_QURAN unchanged')).toBeInTheDocument();
  });
});
