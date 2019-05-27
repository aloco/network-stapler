import * as express from "express";
import API from "../APITestTargets/API";

const multer = require("multer");

export const mockServerPort = "5003";
export const mockServerBaseUrl = "http://localhost:" + mockServerPort;



export class MockServer {
    // the express and server instance
    app: express.Express;
    server;

    constructor() {
        this.app = express();
        this.setupRoutes();
    }

    setupRoutes() {

        // url must be equal to API.contactsAmountOfList
        this.app.get("/api/v1/test", (req, res, next) => {
            res.header("Content-Type", "application/json");
            res.send({ someNumberResponse: 123 });
        });

        // url must be equal to API.contactsAmountOfList
        this.app.get("/api/v1/test", (req, res, next) => {
            res.header("Content-Type", "application/json");
            res.statusCode = 400;
            res.send({ error: "something went wrong "});
        });

        this.app.get("/api/v1/return-error-status-code-199", (req, res, next) => {
            res.header("Content-Type", "application/json");
            res.sendStatus(199);
        });

        // check formdata upload
        // url must be equal to API.uploadTestMultipartFormData
        const upload = multer();
        this.app.post("/api/v1/testMultipartUpload", upload.none(), (req, res) => {
            const formData = req.body;
            res.send({ testField: formData.testField });
        });
    }

    start() {
        // Start now
        this.server = this.app.listen(mockServerPort, () => {
            console.log("mock server running on port" + mockServerPort);
        });

    }

    stop() {
        this.server.close();
        this.server = null;
    }
}

export const server = new MockServer();

