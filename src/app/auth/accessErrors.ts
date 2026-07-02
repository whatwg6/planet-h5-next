export class AuthRequiredError extends Error {
  constructor(message = "登录已失效") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ForbiddenAccessError extends Error {
  constructor(message = "无权限访问") {
    super(message);
    this.name = "ForbiddenAccessError";
  }
}
