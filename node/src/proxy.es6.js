import net from 'net';
import ac from 'async';
import miss from 'mississippi2';

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

    miss.fromValue(task.cmd)
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
