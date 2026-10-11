const http = require("node:http");
const mongoose = require("mongoose");

const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hello-world";

const greetingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  text: { type: String, required: true },
}, { timestamps: true });

const Greeting = mongoose.model("Greeting", greetingSchema);

const server = http.createServer((request, response) => {
  if (request.url !== "/") {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  Greeting.findOne({ key: "default" }).lean()
    .then((greeting) => {
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(greeting.text);
    })
    .catch((error) => {
      console.error("Failed to load greeting:", error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Internal Server Error");
    });
});

async function start() {
  await mongoose.connect(mongoUri);
  await Greeting.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { text: "Hello World!" } },
    { upsert: true },
  );

  server.listen(port, "0.0.0.0", () => {
    console.log(`Hello World app listening on port ${port}`);
  });
}

async function shutdown() {
  server.close(async () => {
    await mongoose.disconnect();
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exitCode = 1;
});