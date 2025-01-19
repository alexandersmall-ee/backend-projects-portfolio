const request = require("supertest");
const app = require("../server");

describe("GET /", () => {
  it("should return a welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Welcome");
  });
});
