import net from 'net';
import ac from 'async';
import miss from 'mississippi';
import split from "split2"

miss.split = split;

miss.fromString = (string) => {
  return miss.from((size, next) => {
    if (string.length <= 0) return next(null, null)

    var chunk = string.slice(0, size)
    string = string.slice(size)

    next(null, chunk)
  });
};

miss.debug = (log, prefix) => {
  return miss.through((chunk, _, cb) => {
    log(`${prefix}::${chunk.toString()}`)
    cb(null, chunk);
  });
};

const DEFAULTS = {
  host: "localhost",
  port: 9000
};

let proxy = function(options) {
  let opts = Object.assign({}, DEFAULTS, options);

  const queue = ac.queue((task, cb) => {
    let upstream = net.connect({ server: opts.host, port: opts.port });

    miss.fromString(task.cmd)
      .pipe(miss.debug(console.log, "downstream"))
      .pipe(upstream)
      .on("error", _ => {
        console.log(error);
        upstream.destroy();
      })
      .on("end", _ => {
        console.log("upstream end");
        cb();
      })
      .on("close", _ => console.log("upstream has closed."))
      .pipe(miss.debug(console.log, "__upstream"))
      .pipe(task.client, { "end": false })
  }, 1);

  const server = net.createServer(function(downstream) {
    downstream
      .on("close", _ => console.log("downstream has closed."))
      .on("error", _ => {
        console.log("downstream has a error.");
        downstream.destroy();
      })
      .pipe(miss.split())
      .pipe(miss.through.obj(function(chunk, _, cb) {
        let data = {
          cmd: chunk,
          client: downstream
        };

        this.push(data);

        cb();
      }))
      .pipe(miss.through.obj((chunk, _, cb) => queue.push(chunk, _ => {
        cb();
      })));
  });

  return server;
};

module.exports = proxy
