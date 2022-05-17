# Editor API Security

The authorization and authentication on the API side is fairly simple at present.

When the user is logged on to the site any requests made to the api from the React application will include an `Authorization` header.
The value for the header will be the token sent by hyrdra on log in.

The API checks for the presence of this header and then makes a request to hydra to check that the token is still valid.
If the token is valid hydra will return some information about the user including their ID. This ID is then used by the API application to associate requests with the user.

So when a user creates a new project the user ID stored against that token comes from hydra based on the token.

There is an `ApiController` base class which other controllers in the API application inherit from. This exposes helper methods for accessing the users ID and automatically throwing unauthorized errors when needed.

We are using the CanCanCan gem to handle authorization for accessing records. The `ability` file is currently fairly sparse as there is not a great deal of functionality required at present.

Permissions:

`Show` project:     Anyone
`Create` project:   Owner
`Update` project:   Owner
`Destroy` project:  Owner
`Index` project:    Owner (You can only see a list of your own projects. There is no way to get a list of all projects.)
