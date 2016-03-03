jest.dontMock('../src/filters');

const filters = require('../src/filters');

describe('time filter', () => {
    it('should format time', () => {
        expect(filters.time(new Date(2015, 0, 17, 23, 41))).toBe('23:41');
    });

    it('should add padding', () => {
        expect(filters.time(new Date(2015, 0, 17, 1, 1))).toBe('01:01');
    });

    it('should return empty string', () => {
        expect(filters.time(null)).toBe('');
    });
});

describe('date filter', () => {
    it('should format date', () => {
        expect(filters.date(new Date(2015, 0, 17, 23, 41))).toBe('2015-01-17');
    });

    it('should return empty string', () => {
        expect(filters.date(null)).toBe('');
    });
});

describe('duration filter', () => {
    it('should format no difference', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 41, 0)
        )).toBe('just now');
    });

    it('should format seconds', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 41, 15)
        )).toBe('just now');
    });

    it('should format one minute', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 42, 0)
        )).toBe('1min');
    });

    it('should format minutes', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 50, 15)
        )).toBe('9min');
    });

    it('should format one hour', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 0, 41, 15)
        )).toBe('1h');
    });

    it('should format hours and minutes', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 0, 51, 15)
        )).toBe('1h 10min');
    });

    it('should format many hours', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 1, 41, 15)
        )).toBe('2h');
    });

    it('should format many hours and minutes', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 2, 20, 15)
        )).toBe('2h 39min');
    });

    it('should format duration from now if end not defined', () => {
        expect(filters.duration(new Date(Date.now() - 60 * 1000))).toBe('1min');
    });
});
