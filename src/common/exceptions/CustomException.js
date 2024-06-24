class CustomException extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'CustomException'; // (2)
  }
}

export default CustomException;
