import { describe, it, expect } from "vitest";

import {
  AppError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
  LimitExceededError,
  ConflictError,
  toErrorResponse,
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

describe("toErrorResponse", () => {
  it("converts NotFoundError", () => {
    const result = toErrorResponse(new NotFoundError("Demo not found"));
    expect(result).toEqual({
      error: { message: "Demo not found", code: "NOT_FOUND", statusCode: 404 },
    });
  });

  it("converts ForbiddenError", () => {
    const result = toErrorResponse(new ForbiddenError());
    expect(result).toEqual({
      error: { message: "Access denied", code: "FORBIDDEN", statusCode: 403 },
    });
  });

  it("converts UnauthorizedError", () => {
    const result = toErrorResponse(new UnauthorizedError());
    expect(result).toEqual({
      error: {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
        statusCode: 401,
      },
    });
  });

  it("converts ValidationError", () => {
    const result = toErrorResponse(new ValidationError());
    expect(result).toEqual({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        statusCode: 400,
      },
    });
  });

  it("converts LimitExceededError", () => {
    const result = toErrorResponse(new LimitExceededError());
    expect(result).toEqual({
      error: {
        message: "Limit exceeded",
        code: "LIMIT_EXCEEDED",
        statusCode: 403,
      },
    });
  });

  it("converts ConflictError", () => {
    const result = toErrorResponse(new ConflictError());
    expect(result).toEqual({
      error: {
        message: "Resource already exists",
        code: "CONFLICT",
        statusCode: 409,
      },
    });
  });

  it("returns 500 for generic Error", () => {
    const result = toErrorResponse(new Error("something broke"));
    expect(result).toEqual({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    });
  });

  it("returns 500 for string", () => {
    const result = toErrorResponse("oops");
    expect(result).toEqual({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    });
  });

  it("returns 500 for null", () => {
    const result = toErrorResponse(null);
    expect(result).toEqual({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    });
  });

  it("returns 500 for undefined", () => {
    const result = toErrorResponse(undefined);
    expect(result).toEqual({
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    });
  });
});
