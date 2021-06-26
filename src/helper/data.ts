type listElement = { value: any; cond: boolean } | any;

export const condList = (...args: listElement[]): any[] =>
  args.reduce((result, el) => {
    if (typeof el !== 'object') {
      result.push(el);

      return result;
    }

    if (typeof el.cond === 'function' && el.cond() || el.cond) {
      result.push(typeof el.value === 'function' ? el.value() : el.value);
    }

    return result;
  }, []);
