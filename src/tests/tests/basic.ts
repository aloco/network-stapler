import "mocha";
import { expect } from "chai";
import { APIClient, IAPITarget, IAPIClientOptions } from "../../APIClient";
import * as mockServer from "../utils/MockServer";
import API from "../APITestTargets/API";

describe("GET /api/v1/test request", function () {

    it("should setup basic APIClient, should send basic GET request", function (done) {

        const options: IAPIClientOptions = {
            baseUrl: mockServer.mockServerBaseUrl,
            defaultEncodeBody: JSON.stringify
        };

        const client = new APIClient(options);

        const target = API.contactsAmountOfList();
        
        client.request(target).then(response => {
            return response.json().then(result => {
                expect(result.someNumberResponse).equal(123);
                done();
            });
        }).catch(error => {
            done(error);
        });
    });

    it("should setup basic APIClient, should send formdata and use FormData for body encoding, but default encoding is JSON.stringify", function (done) {

        const options: IAPIClientOptions = {
            baseUrl: mockServer.mockServerBaseUrl,
            defaultEncodeBody: JSON.stringify
        };

        const client = new APIClient(options);
        const body = {
            testField: "testValue"
        };
        const target = API.uploadTestMultipartFormData(body);
        
        client.request(target).then(response => {
            return response.json().then(result => {
                expect(result.testField).equal(body.testField);
                done();
            });
        }).catch(error => {
            done(error);
        });
    });
});
