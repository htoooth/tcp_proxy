desc("compile es6 t0 es5")
task("babel", function() {
  console.log("ok");
});

watchTask("watch", ["babel"], function() {
});
