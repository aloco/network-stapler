# network-stapler

This isn´t another full featured client library for making HTTP requests. It´s just a thin abstraction layer around `fetch` helping you to organize your network code in a more declarative way. 

The concept of `network-stapler` follows the concept of [Moya]( https://github.com/Moya/Moya) in a reduced form. 

Usually when writing an application you may have an ad hoc network layer called like NetworkManager or APIClient. Each time you start with a new app you may copy paste the network client manager from your other apps to your new app and may enhance or change this and that. Those smaller and bigger changes make it difficult to maintain your applications since each network client in each application does the same but looks somehow different and is somehow different organized. 

>`network-stapler` is meant to be used as an consistent way to setup and organize your network client code.

### Features

- Compile-time check of correct use of API endpoint
- Typed API responses
- Build in mechanism for providing mock data to consumer

## Basic Usage

Usually you want a single place for all your network request definitions so all URL or parameter changes are made on a single point and not in x files, each time you use a specific server endpoint. 

So to not end up in a single file full of network requests or single requests spread around your codebase `network-stapler` splits network request definitions with the actual request mechanism. `IAPITarget` or `ITypedAPITarget<T>` represent an API endpoint and are as a best practice encapsulated within a function. 

```typescript
const UserAPI = {
    login(username: string, password: string): ITypedAPITarget<IUser> => {
        return {
            url: "api/v1/login",
            method: "POST",
            body: {
                username,
                password
            },
            parse: (json) => {
                if (json.accesstoken && json.userid) {
                    return json as IUser;
                } else {
                    throw new Error("invalid response");
                }
            }
        };
    },
    
    logout(): IAPITarget => {
        return {
            url: "api/v1/logout",
            method: "GET",
        }
    }
}
```

> You may have noticed that the login function returns `ITypedAPITarget` and the logout function `IAPITarget` The difference is between those interfaces is that `ITypedAPITarget` requires a parse function to transform the result json into a defined type. This makes the usage of `network-stapler` really handy because you can always work with a typed result of your network request and don´t need to check the result each time you make the result at multiple locations in your code. If you don´t care about the type of result body, simply use `IAPITarget`

After defining the available server endpoints, you need to create an instance of `APIClient`.

```typescript
const options: IAPIClientOptions = {
    baseUrl: "https://yourserver.com"
};

const client = new APIClient(options);
```

You can share one `APIClient` across your application. You can also make multiple instances if you have multiple services from where you have to query data. 

After creating your client you can make requests in three ways

```typescript
const target: ITypedAPITarget<IUser> = UserAPI.login("aloco90", "awesomepassword");

client.request(target).then(result => {
    // result is the plain response object
}).catch(error => {
    // something went wrong
});

client.requestJSON(target).then(result => {
    // result is the response body as json
}).catch(error => {
    // something went wrong
});

client.requestType(target).then(result => {
    // result is the typed response body
    // in this case an implementation of `IUser`
}).catch(error => {
    // something went wrong
});
```



## Contributing

- Create something awesome, make the code better, add some functionality, whatever (this is the hardest part).
- [Fork it](http://help.github.com/forking/)
- Create new branch to make your changes
- Commit all your changes to your branch
- Submit a [pull request](http://help.github.com/pull-requests/)

