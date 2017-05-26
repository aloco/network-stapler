import "mocha";
import { expect } from "chai";
import { APIClient, IAPITarget, IAPIClientOptions } from "../../APIClient";
import * as mockServer from "../utils/MockServer";

describe("GET /api/v1/test request", function () {

    it("should setup basic APIClient, should send basic GET request", function (done) {

        const options: IAPIClientOptions = {
            baseUrl: mockServer.mockServerBaseUrl
        };

        const client = new APIClient(options);

        const target: IAPITarget = {
            method: "GET",
            queryParameters: {
                parameters: "testparams",
                test: 123
            },
            headers: {
                "x-custom-header": "123"
            },
            url: "/api/v1/test"
        };

        client.request(target).then(response => {
            return response.json().then(result => {
                expect(result.someNumberResponse).equal(123);
                done();
            });
        }).catch(error => {
            done(error);
        });
    });
});
