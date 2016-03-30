import net from 'net'

const port = 9000;
const upstreamServer = "localhost";
const upstreamPort = 9001;

const server = net.createServer(function(downstream) {
    let upstream = net.connect({ server: upstreamServer, port: upstreamPort }, function() {
        console.log("upstream connect ok");
    });

    downstream.pipe(upstream).pipe(downstream);
});

server.listen(post, () => console.log(`proxy server started on port ${port}`));
