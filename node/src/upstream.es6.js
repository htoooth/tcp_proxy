import net from "net"
import es from "event-stream"

const port = 9001;

const server = net.createServer(function(client) {
  client
    .pipe(es.map(function(data, cb) {
      console.log("receive data : " + data)
      data += "<<END>>"
      cb(null, data);
    }))
    .pipe(client);
});

server.listen(port, function() {
  console.log("upstream server started on port " + port);
});
