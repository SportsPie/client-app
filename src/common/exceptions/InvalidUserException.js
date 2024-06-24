class InvalidUserException extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidUserException';
  }
}

export default InvalidUserException;
