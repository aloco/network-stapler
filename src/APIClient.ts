import * as queryString from "query-string";
import urljoin = require("url-join");


/**
 * defines a request target
 */
export interface IAPITarget {
    /**
     * relative url to resource (without base url)
     */
    url: string;
    /**
     * http method
     */
    method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
    /**
     * body of request
     */
    body?: object;
    /**
     * query parameters
     */
    queryParameters?: object;
    /**
     * used to mock a response for testing / development purpose
     */
    mockResponseJSON?: () => object;
    /**
     * header of request
     */
    headers?: object;
}

/**
 * defines a request target with a typed result
 */
export interface ITypedAPITarget<T> extends IAPITarget {
    /**
     * validate / transform response json data to typed data
     */
    parse: (data: object) => T;
}
export interface IAPIClientOptions {
    /**
     * base url of remote service
     */
    baseUrl: string;
    /**
     * used to modify or add header before a request is executed (like add authorization headers)
     */
    injectHeaders?: (target: IAPITarget, headers: object) => object;
    /**
     * indicates if client should mock all responses 
     */
    stubResponse?: boolean;
    /**
     * delay of response when mocking requests
     */
    stubResponseTime?: number;
    /**
     * throws status codes < 200 || > 399 as APIClientError
     */
    throwOnErrorStatusCodes?: boolean;
}

/**
 * executes a requests, defined by APITarget
 */
export class APIClient {

    options: IAPIClientOptions;

    constructor(options: IAPIClientOptions) {
        this.options = options;
        this.options.stubResponse = options.stubResponse || false;
        this.options.stubResponseTime = options.stubResponseTime || 200;
        this.options.throwOnErrorStatusCodes = options.throwOnErrorStatusCodes || true;
    }

    /**
     * executes a request for the given target,
     * transforms target definition to fetch parameters
     * throws `APIClientError` if `throwOnErrorStatusCodes` is true and status code of response is < 200 || > 399
     * @param target request target
     */
    request(target: IAPITarget): Promise<Response> {

        let headers = target.headers;
        if (!headers) {
            headers = {};
        }

        if (this.options.injectHeaders) {
            headers = this.options.injectHeaders(target, headers);
        }

        const query = queryString.stringify(target.queryParameters);
        let requestUrl = urljoin(this.options.baseUrl, target.url);
        if (query) {
            requestUrl = urljoin(requestUrl, "?" + query);
        }

        const options = {
            method: target.method || "GET",
            body: JSON.stringify(target.body),
            headers: headers
        };

        return fetch(requestUrl, options)
            .then(response => {
                if (this.options.throwOnErrorStatusCodes) {
                    if (response.status >= 200 && response.status < 400) {
                        return response;
                    }
                    throw new APIClientStatusCodeError(response, response.status);
                } else {
                    return response;
                }
            });
    }

    /**
     * executes a request for the given target and transforms the result to JSON
     * throws `APIClientError` if `throwOnErrorStatusCodes` is true and status code of response is < 200 || > 399
     * @param target
     */
    requestJSON(target: IAPITarget): Promise<object> {
        if (this.options.stubResponse) {

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (target.mockResponseJSON) {
                        resolve(target.mockResponseJSON());
                    } else {
                        reject(new Error("No Mockdata provided"));
                    }
                }, this.options.stubResponseTime);
            });
        } else {
            return this.request(target).then(response => {
                return response.json();
            }).catch(e => {
                // transform error response into json
                if (e instanceof APIClientStatusCodeError) {
                    return e.response.json().then(json => {
                        throw new APIClientStatusCodeError(json, e.statusCode);
                    });
                }
                throw e; // rethrow unknown error
            });
        }
    }

    /**
     * executes a request for the given target and asks target to transform JSON result into type
     * throws `APIClientError` if `throwOnErrorStatusCodes` is true and status code of response is < 200 || > 399
     * @param target
     */
    requestType<T>(target: ITypedAPITarget<T>): Promise<T> {
        return this.requestJSON(target)
            .then(json => {
                return target.parse(json);
            });
    }
}


export function createAPIClient(options: IAPIClientOptions) {
    return new APIClient(options);
}

/**
 * represents a error caused by invaid statuscode
 */
export class APIClientStatusCodeError {
    response: any;
    statusCode: number;

    constructor(response: any, statusCode: number) {
        this.statusCode = statusCode;
        this.response = response;
    }
}
