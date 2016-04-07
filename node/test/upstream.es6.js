import net from "net";
import miss from 'mississippi2';

const server = net.createServer(function(client) {
  client
    .pipe(miss.through((chunk, _, cb) => {
      console.log("receive:" + chunk);
      cb(null, chunk);
    }))
    .pipe(client)
    .on("error", function(err) {
      console.log(err);
    });
});

let port = 9002;

server.listen(port, _ => console.log(`upstream start on:${port}`));
