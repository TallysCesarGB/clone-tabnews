const { exec } = require("node:child_process");

let dotCount = 0;
let animationInterval;

function animateDots() {
  process.stdout.write("\n\n ⏳ Waiting on Postgres to accept connections");

  animationInterval = setInterval(() => {
    process.stdout.write("\r");
    process.stdout.write("\n\n ⏳ Waiting on Postgres to accept connections");

    dotCount = (dotCount + 1) % 4;

    for (let i = 0; i < dotCount; i++) {
      process.stdout.write(".");
    }
  }, 500);
}

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout, stderr) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }
    console.log("\n\n ✅ Postgres is accepting connections\n");
  }
}

process.stdout.write("\n\n ⏳ Waiting on Postgres to accept connections");
checkPostgres();
