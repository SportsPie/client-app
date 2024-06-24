class AccessDeniedException extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccessDeniedException';
  }
}

export default AccessDeniedException;
