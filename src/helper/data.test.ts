import { condList } from './data';

describe('data helper', () => {
  describe('condList()', () => {
    it('should return a list when simple args are provided', () => {
      expect(condList(1, 2, 3)).toEqual([1, 2, 3])
    });

    it(`should filter elements if a condition is 'false'`, () => {
      expect(condList(
        1,
        { value: 2, cond: false },
        3
      )).toEqual([1, 3])
    });

    it(`should filter elements if a condition is 'null'`, () => {
      expect(condList(
        1,
        { value: 2, cond: null },
        3
      )).toEqual([1, 3])
    });

    it(`should filter elements if a condition is 'undefined'`, () => {
      expect(condList(
        1,
        { value: 2, cond: undefined },
        3
      )).toEqual([1, 3])
    });

    it(`should filter elements if a condition is ''`, () => {
      expect(condList(
        1,
        { value: 2, cond: '' },
        3
      )).toEqual([1, 3])
    });


    it(`should not filter elements if a condition is 'true'`, () => {
      expect(condList(
        1,
        { value: 2, cond: true },
        3
      )).toEqual([1, 2, 3])
    });

    it(`should filter elements if a condition is a 'string'`, () => {
      expect(condList(
        1,
        { value: 2, cond: 'a string' },
        3
      )).toEqual([1, 2, 3])
    });

    it(`should filter elements if a condition is a 'number'`, () => {
      expect(condList(
        1,
        { value: 2, cond: 1 },
        3
      )).toEqual([1, 2, 3])
    });

    it(`should filter elements if a condition is an 'object'`, () => {
      expect(condList(
        1,
        { value: 2, cond: {} },
        3
      )).toEqual([1, 2, 3])
    });

    it(`should filter elements if a condition is an 'array'`, () => {
      expect(condList(
        1,
        { value: 2, cond: [] },
        3
      )).toEqual([1, 2, 3])
    });

    it('should evaluate a function to filter the list', () => {
      expect(condList(
        { value: 1, cond: () => true },
        { value: 2, cond: () => false },
        3
      )).toEqual([1, 3])
    })
  });
})
