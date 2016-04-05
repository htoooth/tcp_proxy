import net from 'net'
import Promise from 'bluebird'
import ac from 'async'
import miss from 'mississippi'
import es from "event-stream"

const port = 9000;
const upstreamServer = "localhost";
const upstreamPort = 9001;

function fromString(string) {
  return miss.from((size, next) => {
    // if there's no more content
    // left in the string, close the stream.
    if (string.length <= 0) return next(null, null)

    // Pull in a new chunk of text,
    // removing it from the string.
    var chunk = string.slice(0, size)
    string = string.slice(size)

    // Emit "chunk" from the stream.
    next(null, chunk)
  });
};

const upstream = net.connect({ server: upstreamServer, port: upstreamPort }, function() {
  console.log("upstream connect ok");
});

upstream.setTimeout(10000);
upstream.setKeepAlive(true, 3000);

upstream.on("error", function(error) {
  console.log(error);
});

const queue = ac.queue((task, cb) => {
  console.log(`command:${task.cmd}`)
  fromString(task.cmd)
    .on("end", function() {
      cb();
    })
    .pipe(upstream, { "end": false })
    .pipe(task.client, { "end": false });
}, 1);

const server = net.createServer(function(downstream) {
  downstream
    .pipe(es.split())
    .pipe(miss.through.obj(function(chunk, enc, cb) {

      console.log("receive:" + chunk);
      let data = {
        cmd: chunk,
        client: downstream
      };

      this.push(data);

      cb();
    }))
    .pipe(miss.through.obj((chunk, enc, cb) => {
      console.log("commnd:" + chunk.cmd);

      queue.push(chunk, (err) => {
        console.log("finish processing");
      });

      cb();
    }));
});

server.listen(port, () => console.log(`proxy server started on port ${port}`));

async function printAsync(value, ms) {
  let result = await timeout(ms);
  console.log(value + result)
}

function timeout(ms) {
  return new Promise((resolve, reject) => setTimeout(() => resolve("huangtao"), ms));
}

printAsync("hello,world ", 1000);
