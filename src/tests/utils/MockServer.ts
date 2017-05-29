import * as express from "express";

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
        this.app.get("/api/v1/return-error-status-code-400", (req, res, next) => {
            res.header("Content-Type", "application/json");
            res.sendStatus(400);
        });

        this.app.get("/api/v1/return-error-status-code-199", (req, res, next) => {
            res.header("Content-Type", "application/json");
            res.sendStatus(199);
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

