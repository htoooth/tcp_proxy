import Rx from "rx";

let count = 0;

const random = (cb) => {
    console.log("one" + (count++));
    let result = Math.random();
    if (result < 0.1) {
        cb(null, result);
    } else {
        cb("error");
    }
};

const source = Rx.Observable.defer(() => Rx.Observable.fromNodeCallback(random)())
    .retryWhen(err => err
        .zip(Rx.Observable.range(1, 3), (x, y) => y)
        .flatMap(x => Rx.Observable.timer(1000))
    );

const subscription = source.subscribe(
    function(x) {
        console.log('Next: ' + x);
    },
    function(err) {
        console.log('Error: ' + count);
    },
    function() {
        console.log('Completed' + count);
    });
