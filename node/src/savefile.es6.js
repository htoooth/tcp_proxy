import request from "superagent";
import fs from "fs";

request.get("https://dn-cnode.qbox.me/Fk9ptLpB2uwdPZAUYml60pEZwVU6")
  .end((err,rep)=>{
    let file = fs.createWriteStream("a.jpg");
    rep.pipe(file);
  })