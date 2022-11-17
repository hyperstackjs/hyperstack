class ValidationError extends Error {
  readonly isValidationError = true

  constructor(public errors?: any) {
    super()
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export { ValidationError }
