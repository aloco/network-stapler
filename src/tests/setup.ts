
import { server } from "./utils/MockServer";

import "mocha";

import chai = require("chai");
// import chaiAsPromised = require("chai-as-promised");
import requireDir = require("require-dir");

require("isomorphic-fetch");

import chaiHttp = require("chai-http");
// Setup chai plugins
chai.use(chaiHttp);



before(function (done) {
    server.start();
    done();
});


// app related tests...
requireDir("./tests", {
    recurse: true
});
