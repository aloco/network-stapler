import { APIClient, IAPIClientOptions, IAPITarget, APIClientStatusCodeError, ITypedAPITarget } from "./APIClient";

import { Observable, Subject } from "rxjs";
/**
 * provides and handles data for refresh access token when needed
 */
export interface ICredentialsHandler<C> {
    /**
     * should store the newly received accesstoken 
     */
    refreshAccessTokenSuccess: (data: C) => void;
    /**
     * should handle unsuccessful refresh access token attempts
     */
    refreshAccessTokenError: (error) => void;
    /**
     * should provide endpoint target information for refreshing access token
     */
    getRefreshAccessTokenTarget: () => ITypedAPITarget<C>;
    /**
     * defines error code on which token exchange shall start
     */
    refreshAccessTokenOnStatusCode: number;
}

/**
 * Wrapper around APIClient
 * handles automatically access token refresh and queues all incoming requests
 * provides Observable and Promise API
 */
export class AuthAPIClient<C> {

    credentialsHandler?: ICredentialsHandler<C>;

    private client: APIClient;

    // running refresh access token request
    private refreshAccessTokenPublishedObservable?: Observable<C>;

    constructor(options: IAPIClientOptions, credentialsHandler?: ICredentialsHandler<C>) {
        this.credentialsHandler = credentialsHandler;
        this.client = new APIClient(options);
    }

    requestObservable(target: IAPITarget): Observable<any> {
        return this.refreshAccessTokenIfNeeded(Observable.defer(() => this.client.request(target)));
    }
    request(target: IAPITarget): Promise<any> {
        return this.requestObservable(target).toPromise();
    }

    requestJSONObservable(target: IAPITarget): Observable<any> {
        return this.refreshAccessTokenIfNeeded(Observable.defer(() => this.client.requestJSON(target)));
    }
    requestJSON(target: IAPITarget): Promise<any> {
        return this.requestJSONObservable(target).toPromise();
    }

    requestTypeObservable<T>(target: ITypedAPITarget<T>): Observable<T> {
        return this.refreshAccessTokenIfNeeded(Observable.defer(() => this.client.requestType(target)));
    }
    requestType<T>(target: ITypedAPITarget<T>): Promise<T> {
        return this.requestTypeObservable(target).toPromise();
    }

    private refreshAccessTokenIfNeeded<T>(request: Observable<T>): Observable<T> {
        // if there is no credentials handler -> no refresh access token handling
        let credentialsHandler;
        if (!this.credentialsHandler) {
            return request;
        } else {
            credentialsHandler = this.credentialsHandler;
        }

        // if there is already a running refresh access token request, attach request
        if (this.refreshAccessTokenPublishedObservable) {
            console.log("attach request to running refresh accesstoken");
            return this.refreshAccessTokenPublishedObservable
                .flatMap(value => {
                    console.log("refresh access token finsihed, execute request");
                    return request;
                });
        } else {
            // attach unauthorized error handler to request
            return request.catch(error => {

                console.log("encountered error", error);

                // if error is of type APIClientStatusCodeError and means unauthorized
                // attach to refresh access token request
                if (error instanceof APIClientStatusCodeError && error.statusCode === credentialsHandler.refreshAccessTokenOnStatusCode) {

                    console.log("status code matches refresh token");
                    // if there is no running refresh access token request create a new one
                    if (!this.refreshAccessTokenPublishedObservable) {
                        console.log("no running refresh token");
                        // ask for refresh access token target
                        // use APIClient directly to avoid infinite refresh access token attempts if refresh access token call is also unauthorized
                        let tempObs = Observable.defer(() => this.client.requestType(credentialsHandler.getRefreshAccessTokenTarget()));

                        // attach side effects, report result of refresh token request
                        // remove reference to running request
                        this.refreshAccessTokenPublishedObservable = tempObs.delay(5000).do(
                            (value) => { // on next value
                                console.log("received new value", value);
                                // report new access token to credentials handler
                                credentialsHandler.refreshAccessTokenSuccess(value);
                                // remove reference to refresh access token request
                                this.refreshAccessTokenPublishedObservable = undefined;
                            },
                            (err) => { // on error
                                console.log("received error", error);
                                // report error to credentials handler
                                credentialsHandler.refreshAccessTokenError(err);
                                // remove reference to refresh access token request
                                this.refreshAccessTokenPublishedObservable = undefined;
                            },
                            () => { // on completion
                                console.log("completed");
                            })
                            // publish observable (hot), add refCount so the first subscriber starts procedure 
                            // every following subscriber gets results of already started procedure
                            .publish().refCount();
                    }

                    // attach original request to refresh access token request
                    return this.refreshAccessTokenPublishedObservable.flatMap(value => {
                        console.log("refresh access token finsihed, reexecute inital request");
                        return request;
                    });
                }

                // throw any other errors                
                throw error;

            });
        }
    }
}

export function createAuthAPIClient<C>(options: IAPIClientOptions, credentialsHandler: ICredentialsHandler<C>) {
    return new AuthAPIClient(options, credentialsHandler);
}



