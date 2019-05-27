import "mocha";
import { expect } from "chai";
import { APIClient, IAPITarget, IAPIClientOptions, APIClientStatusCodeError } from "../../APIClient";
import * as mockServer from "../utils/MockServer";

describe("should test APIClient options", function () {

    it("should throw when encountering statuscode 400", function (done) {

        const options: IAPIClientOptions = {
            baseUrl: mockServer.mockServerBaseUrl,
            throwOnErrorStatusCodes: true,
            defaultEncodeBody: JSON.stringify
        };

        const client = new APIClient(options);

        const error400Target: IAPITarget = {
            method: "GET",
            url: "/api/v1/return-error-status-code-400"
        };

        client.request(error400Target).then(value => {
            expect(value).to.be.empty("empty", "expected an error in catch block");
        }).catch(error => {
            done();
        });
    });

    it("should throw when encountering statuscode 400 and transform error to json when using requestJSON", function (done) {
        const options: IAPIClientOptions = {
            baseUrl: mockServer.mockServerBaseUrl,
            throwOnErrorStatusCodes: true,
            defaultEncodeBody: JSON.stringify
        };

        const client = new APIClient(options);

        const error400Target: IAPITarget = {
            method: "GET",
            url: "/api/v1/return-error-status-code-400"
        };

        client.requestJSON(error400Target).then(value => {
            expect(value).to.be.empty("empty", "expected an error in catch block");
        }).catch(error => {
            if (error instanceof APIClientStatusCodeError) {
                console.log(error);
            }
            done();
        });



    });
});
