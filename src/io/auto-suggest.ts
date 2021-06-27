const { AutoComplete } = require('enquirer');

export class AutoSuggest extends AutoComplete {
  constructor(options) {
    super(options);
  }

  suggest(input = this.input, choices = this.state._choices) {
    if (typeof this.options.suggest === 'function') {
      return this.options.suggest.call(this, input, choices);
    }

    let str = input.toLowerCase();

    const filtered = choices.filter((ch) => !ch._userInput).filter((ch) => ch.message.toLowerCase().includes(str));

    if (!filtered.length && this.options.inputNoChoice) {
      filtered.push({ name: input, message: input, value: input, _userInput: true });
    }

    return filtered;
  }
}
