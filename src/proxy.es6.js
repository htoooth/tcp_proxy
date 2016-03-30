import net from 'net'
import Promise from 'bluebird'

const port = 9000;
const upstreamServer = "localhost";
const upstreamPort = 9001;

const server = net.createServer(function(downstream) {
  let upstream = net.connect({ server: upstreamServer, port: upstreamPort }, function() {
    console.log("upstream connect ok");
  });

  downstream.pipe(upstream).pipe(downstream);
});

server.listen(port, () => console.log(`proxy server started on port ${port}`));

async function printAsync(value, ms) {
  await timeout(ms);
  console.log(value)
}

function timeout(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

printAsync("hello,world", 50);
