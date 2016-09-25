import Promise from "bluebird";
import R from "ramda";
import fs from "fs";
import path from "path";
import Rx from "rx";
import RxNode from "rx-node";
import { assert } from "chai";

// function test() {
//     Promise.reject({ err: "fds" }).catch(err => console.log(err));
// };

// test();

// function red() {
//     console.log("red");
// }

// function green() {
//     console.log("green");
// }

// function yellow() {
//     console.log("yellow");
// }

// let tic = (time, cb) => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             cb();
//             resolve();
//         }, time);
//     });
// }

// let tick = () => tic(3000, red).then(() => tic(1000, green)).then(() => tic(2000, yellow)).then(() => setImmediate(tick));


function walk(dir) {
    // fs.readdir(dir, (err, files) => {
    //     R.map(
    //         R.ifElse(
    //             (f) => fs.lstatSync(f).isDirectory(), walk(R.__, callback), (f) => callback(null, f)
    //         )
    //     )(files);
    // });

    // let readDirAsync = Promise.promisify(fs.readdir);
    // let lstatAsync = Promise.promisify(fs.lstat);

    // return readDirAsync(dir).then(files => {

    //     return Promise.all(files.map(f => {
    //         let file = path.join(dir, f);

    //         return lstatAsync(file).then(stat => {
    //             if (stat.isDirectory()) {
    //                 return walk(file);
    //             } else {
    //                 return [file];
    //             }
    //         });
    //     }));
    // }).then(files => {
    //     return files.reduce((pre, cur) => pre.concat(cur));
    // });

    // fs.readdir(dir, (err, files) => {
    // R.forEach(
    //     R.ifElse(
    //         f => fs.lstatSync(path.join(dir, f)).isDirectory(),
    //         f => walk(path.join(dir, f), ext, callback),
    //         f => {
    //             if (path.extname(f) === ext) {
    //                 callback(null, f);
    //             }
    //         }
    //     )
    // )(files);

    // for (var i = files.length - 1; i >= 0; i--) {
    //     let item = i;
    //     fs.lstat(path.join(dir, files[item]), (err, st) => {
    //         if (st.isDirectory()) {
    //             walk(path.join(dir, files[item]), ext, callback);
    //         } else {
    //             if (path.extname(files[item]) === ext) {

    //                 callback(null, files[item]);
    //             }
    //         }
    //     });
    // }

    // files.forEach(f => {
    //     fs.lstat(path.join(dir, f), (err, st) => {
    //         if (st.isDirectory()) {
    //             walk(path.join(dir, f), ext, callback);
    //         } else {
    //             if (path.extname(f) === ext) {
    //                 callback(null, f);
    //             }
    //         }
    //     })
    // });
    // });
}

// walk("c:\\Users\\TaoHuang\\Downloads").then(x => console.log(x));



// let args = process.argv.slice(2);
// let result = R.compose(R.reduce((a, x) => a + x, 0), R.map(x => Number(x)))(args);
// console.log(result);
// 
function max() {
    return Math.max.apply(null, arguments);
}

function filterNumbers() {
    return Array.prototype.filter.call(arguments, function(value) {
        return isNumeric(value);
    });
}

function isNumeric(n) {
    return !isNaN(n) && Number(n) === n;
}

function filterRange(min, max) {
    var args = Array.prototype.slice.call(arguments, 2);
    return Array.prototype.filter.call(args, function(value) {
        return min <= value && value <= max;
    });
}

function Lazy() {
    this.fns = [];
    this.args = [];

    this.add = function() {
        this.fns.push(arguments[0]);
        this.args.push(Array.prototype.slice.call(arguments, 1));
        return this;
    };

    this.invoke = function() {
        var args = [].slice.call(arguments);
        var _that = this;
        return this.fns.reduce(function(acc, cur, index) {
            return cur.apply(null, _that.args[index].concat(acc));
        }, args[0]);
    };
}

// console.log(new Lazy()
//     .add(filterNumbers)
//     .add(filterRange, 2, 7)
//     .add(max)
//     .invoke([1, 8, 6, [], "7", -1, { v: 5 }, 4])); //6


String.prototype.tr1 = function(fromList, toList) {
    fromList = fromList || [];
    toList = toList || [];

    var pairs = {};

    var a = Array.isArray(fromList) ? fromList : fromList.split("");
    var b = Array.isArray(toList) ? toList : toList.split("");

    a.forEach((x, i) => pairs[x] = b[i]);

    return a.reduce((acc, cur) => acc.replace(new RegExp(cur, "g"), function(x) {
        return pairs[x] + "" || "";
    }), this);

}

String.prototype.tr = function(from, to) {
    for (var s = this, i = 0; i < from.length; i++) {
        s = s.split(from[i]).join(to ? to[i] : '');
    }

    return s;
}

String.prototype.tr2 = function(from, to) {
    return (Array.isArray(from) ? from : from.split("")).reduce((acc, cur, i) => acc.split(cur).join(to ? to[i] : ''), this);
}



var str = ["Hello cruel World", "Hola Mundo cruel", "Bonjour Monde cruel", "Kon'nichiwa zankokuna sekai"]
var leet = ["H3ll0 cru3l W0rld", "H0l4 Mund0 cru3l", "B0nj0ur M0nd3 cru3l", "K0n'n1ch1w4 z4nk0kun4 s3k41"]
var upc = ["HEllO crUEl WOrld", "HOlA MUndO crUEl", "BOnjOUr MOndE crUEl", "KOn'nIchIwA zAnkOkUnA sEkAI"]
var vvv = ["HEEEllOOO crUUUEEEl WOOOrld", "HOOOlAAA MUUUndOOO crUUUEEEl", "BOOOnjOOOUUUr MOOOndEEE crUUUEEEl", "KOOOn'nIIIchIIIwAAA zAAAnkOOOkUUUnAAA sEEEkAAAIII"]
var rmv = ["Hll crl Wrld", "Hl Mnd crl", "Bnjr Mnd crl", "Kn'nchw znkkn sk"]



var r = ~~(Math.random() * 4);


function defaultArguments(func, params) {
    // TODO: Program me

    return function() {
        return func.call(params);
    }
}

function add(a, b) {
    return a + b;
}

var add_ = defaultArguments(add, { a: 1, b: 2 });
console.log(add_());
