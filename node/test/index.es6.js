import Proxy from "../src/proxy.es6"

let proxy = Proxy({ "host": "localhost", "port": 9002 });
let port = 9001;
proxy.listen(port, _ => console.log("proxy start on:" + port));
