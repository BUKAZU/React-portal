import SafeBooking from '../SafeBooking';

describe('SafeBooking', () => {
  it('returns HTML with the correct locale label and URL', () => {
    const result = SafeBooking('nl');
    expect(result).toContain('href="http://bukazu.com/veiligheid"');
    expect(result).toContain('Beveiligd en mogelijk gemaakt door BUKAZU');
  });

  it('returns HTML with safe-booking classes', () => {
    const result = SafeBooking('en');
    expect(result).toContain('class="bu-safe-booking"');
    expect(result).toContain('class="bu-safe-booking-link"');
    expect(result).toContain('class="bu-safe-booking-icon"');
  });

  it('returns the correct label for each supported locale', () => {
    expect(SafeBooking('de')).toContain('Gesichert und ermöglicht durch BUKAZU');
    expect(SafeBooking('fr')).toContain('Sécurisé et rendu possible par BUKAZU');
    expect(SafeBooking('es')).toContain('Asegurado y hecho posible por BUKAZU');
    expect(SafeBooking('it')).toContain('Protetto e reso possibile da BUKAZU');
  });

  it('falls back to English for an unknown locale', () => {
    const result = SafeBooking('ja');
    expect(result).toContain('href="http://bukazu.com/en/security"');
    expect(result).toContain('Secured and made possible by BUKAZU');
  });

  it('includes the SVG lock icon', () => {
    const result = SafeBooking('en');
    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
  });
});
