import net from "net"

const server = 'localhost';
const serverPort = 9000;

const client = net.connect({ server: server, port: serverPort }, function() {
  console.log("client connect");
  console.log("send data to server");
  client.write('greeting from client socket\njkfdsklaljkdfskla\nfdskajfkdlsajkldfjslk\n');
  client.write("fd'sa'df'sa'df'as'\n");
});

client.setTimeout(6000);
client.setKeepAlive(true, 3000);

client.on("data", function(data) {
  console.log("receive data: " + data.toString());
});

client.on("error", function(err) {
  console.log(err);
});

client.on("end", function() {
  console.log("client disconnected");
});
