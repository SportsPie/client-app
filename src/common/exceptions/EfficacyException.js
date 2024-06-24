class EfficacyException extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'EfficacyException'; // (2)
  }
}

export default EfficacyException;
