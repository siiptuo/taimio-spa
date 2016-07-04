jest.dontMock('../src/ActivityStats');

const stats = require('../src/ActivityStats');

const activities = [
    {
        tags: ['tag1', 'tag2'],
        started_at: new Date(2016, 6, 4, 10, 0),
        finished_at: new Date(2016, 6, 4, 10, 30),
    },
    {
        tags: ['tag3'],
        started_at: new Date(2016, 6, 4, 10, 45),
        finished_at: new Date(2016, 6, 4, 11, 0),
    },
    {
        tags: ['tag1'],
        started_at: new Date(2016, 6, 4, 12, 0),
        finished_at: new Date(2016, 6, 4, 13, 0),
    },
    {
        tags: [],
        started_at: new Date(2016, 6, 4, 14, 0),
        finished_at: new Date(2016, 6, 4, 17, 0),
    },
    {
        tags: [],
        started_at: new Date(2016, 6, 4, 23, 0),
        finished_at: new Date(2016, 6, 5, 1, 0),
    },
    {
        tags: [],
        started_at: new Date(2016, 6, 5, 15, 0),
        finished_at: new Date(2016, 6, 5, 18, 0),
    },
];

describe('sumTagDurations', () => {
    it('should calculate correctly', () => {
        expect(stats.sumTagDurations(activities)).toEqual({
            tag1: 1.5 * 60 * 60 * 1000,
            tag2: 30 * 60 * 1000,
            tag3: 15 * 60 * 1000,
        });
    });
});

describe('countActivitiesByHour', () => {
    it('should calculate correctly', () => {
        const hours = stats.countActivitiesByHour(activities);
        expect(hours).toEqual([
            1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0,
            1, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 1,
        ]);
    });
});
