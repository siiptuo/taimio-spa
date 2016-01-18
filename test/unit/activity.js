import * as activity from '../../src/activity';

describe('activity input parsing', () => {
    it('should parse empty input', () => {
        expect(
            activity.parseInput('')
        ).toEqual({
            title: '',
            tags: []
        });
    });

    it('should parse whitespace input', () => {
        expect(
            activity.parseInput('   ')
        ).toEqual({
            title: '',
            tags: []
        });
    });

    it('should parse simple title', () => {
        expect(
            activity.parseInput('hello world')
        ).toEqual({
            title: 'hello world',
            tags: []
        });
    });

    it('should parse valid title and tags', () => {
        expect(
            activity.parseInput('hello world #tag1 #tag2')
        ).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2']
        });
    });

    it('should handle extra whitespace', () => {
        expect(
            activity.parseInput('   hello world   #tag1  #tag2 #tag3    ')
        ).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2', 'tag3']
        });
    });

    it('should handle no whitespace', () => {
        expect(
            activity.parseInput('hello world#tag1#tag2#tag3')
        ).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2', 'tag3']
        });
    });
});

describe('activity serialization', () => {
    it('should serialize done activity', () => {
        expect(JSON.parse(activity.serialize({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: new Date(Date.UTC(2015, 0, 18, 14, 0)),
            finished_at: new Date(Date.UTC(2015, 0, 18, 15, 0))
        }))).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: '2015-01-18T14:00:00.000Z',
            finished_at: '2015-01-18T15:00:00.000Z'
        });
    });

    it('should serialize ongoing activity', () => {
        expect(JSON.parse(activity.serialize({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: new Date(Date.UTC(2015, 0, 18, 14, 0)),
            finished_at: null
        }))).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: '2015-01-18T14:00:00.000Z',
            finished_at: null
        });
    });

    it('should unserialize done activity', () => {
        expect(activity.unserialize({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: '2015-01-18T14:00:00.000Z',
            finished_at: '2015-01-18T15:00:00.000Z'
        })).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: new Date(Date.UTC(2015, 0, 18, 14, 0)),
            finished_at: new Date(Date.UTC(2015, 0, 18, 15, 0))
        });
    });

    it('should unserialize ongoing activity', () => {
        expect(activity.unserialize({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: '2015-01-18T14:00:00.000Z',
            finished_at: null
        })).toEqual({
            title: 'hello world',
            tags: ['tag1', 'tag2'],
            started_at: new Date(Date.UTC(2015, 0, 18, 14, 0)),
            finished_at: null
        });
    });
});
