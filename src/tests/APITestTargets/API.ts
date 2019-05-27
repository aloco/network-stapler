import { IAPITarget } from "../../APIClient";

var FormData = require('form-data');

const API = {


    contactsAmountOfList(): IAPITarget {
        return {
            method: "GET",
            queryParameters: {
                parameters: "testparams",
                test: 123
            },
            headers: {
                "x-custom-header": "123"
            },
            url: "/api/v1/test"
        }
    },

    uploadTestMultipartFormData(data: object): IAPITarget {
        return {
            method: "POST",
            url: "/api/v1/testMultipartUpload",
            body: data,
            encodeBody: (body): FormData => {
                // map json body to formdata
                const data = new FormData();
                const keys = Object.keys(body);
                keys.forEach(function(key) {
                    data.append(key, body[key]);
                });
                return data;
            }
        }
    }
}

export default API;