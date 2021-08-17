/* eslint-disable fp/no-this */
/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-class */
export class NpmResponseError extends Error {
  responseMessage: string;
  constructor(message: string, responseMessage: string) {
    super(message);
    this.responseMessage = responseMessage;
  }
}
