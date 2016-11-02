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
            new Date(2015, 0, 17, 23, 41, 0),
            true
        )).toBe('just now');
    });

    it('should format seconds', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 41, 15),
            true
        )).toBe('just now');
    });

    it('should format no difference', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 41, 0)
        )).toBe('0 s');
    });

    it('should format seconds', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 41, 15)
        )).toBe('15 s');
    });

    it('should format one minute', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 42, 0)
        )).toBe('1 min');
    });

    it('should format minutes', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 17, 23, 50, 15)
        )).toBe('9 min');
    });

    it('should format one hour', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 0, 41, 15)
        )).toBe('1 h');
    });

    it('should format hours and minutes', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 0, 51, 15)
        )).toBe('1 h 10 min');
    });

    it('should format many hours', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 1, 41, 15)
        )).toBe('2 h');
    });

    it('should format many hours and minutes', () => {
        expect(filters.duration(
            new Date(2015, 0, 17, 23, 41, 0),
            new Date(2015, 0, 18, 2, 20, 15)
        )).toBe('2 h 39 min');
    });

    it('should format duration from now if end not defined', () => {
        expect(filters.duration(new Date(Date.now() - 60 * 1000))).toBe('1 min');
    });
});
