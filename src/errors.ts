export class NpmResponseError extends Error {
  responseMessage: string;
  constructor(message: string, responseMessage: string) {
    super(message);
    this.responseMessage = responseMessage;
  }
}
