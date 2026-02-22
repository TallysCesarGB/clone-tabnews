const { exec } = require("node:child_process");

let dotCount = 0;
let animationInterval;

function startAnimation() {
  process.stdout.write("\n ⏳ Waiting on Postgres to accept connections");

  animationInterval = setInterval(() => {
    process.stdout.cursorTo(45);
    process.stdout.clearLine(1);
    const dots = ".".repeat(dotCount);
    process.stdout.write(dots);

    dotCount = (dotCount + 1) % 4;
  }, 500);
}

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout, stderr) {
    if (stdout.search("accepting connections") === -1) {
      checkPostgres();
      return;
    }

    clearInterval(animationInterval);

    // Limpa a linha atual e mostra mensagem final
    process.stdout.cursorTo(0);
    process.stdout.clearLine(1);
    console.log("✅ Postgres is accepting connections\n");
  }
}

console.log("\n");
startAnimation();
checkPostgres();
