import { describe, it, expect } from "vitest";

import {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  LimitExceededError,
  ConflictError,
} from "./errors";

describe("AppError", () => {
  it("sets message, statusCode, and code", () => {
    const error = new AppError("test", 500, "TEST");
    expect(error.message).toBe("test");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("TEST");
    expect(error.name).toBe("AppError");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("NotFoundError", () => {
  it("has correct defaults", () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Resource not found");
    expect(error.name).toBe("NotFoundError");
  });

  it("accepts custom message", () => {
    const error = new NotFoundError("Demo not found");
    expect(error.message).toBe("Demo not found");
  });
});

describe("ForbiddenError", () => {
  it("has correct defaults", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });
});

describe("UnauthorizedError", () => {
  it("has correct defaults", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });
});

describe("ValidationError", () => {
  it("has correct defaults", () => {
    const error = new ValidationError();
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});

describe("LimitExceededError", () => {
  it("has correct defaults", () => {
    const error = new LimitExceededError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("LIMIT_EXCEEDED");
  });
});

describe("ConflictError", () => {
  it("has correct defaults", () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe("CONFLICT");
  });
});
