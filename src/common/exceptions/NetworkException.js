class NetworkException extends Error {
  constructor(message, code) {
    super(message); // (1)
    this.code = code;
    this.name = 'NetworkException'; // (2)
  }
}

export default NetworkException;
