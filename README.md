# react-safeway

An opionated typesafe `react-query` extension for both REST and GraphQL queries and mutations.

** Currently this library is only a proposal and is under heavy development **

## Proposal

What is the value add of `react-safeway`?

-   Typesafe query definitions

    -   Single source of type definition
    -   Avoid stating many generics over and over again

    ```typescript
    import { RESTQuery, RESTQueryOpts, useRESTQuery } from "react-safeway"

    export interface Post {
    	id: number
    	title: string
    	completed: boolean
    }

    export const POSTS_QUERY = RESTQuery<Post[]>({
    	// only one location where the generics for data and variables must be stated
    	url: "/posts",
    	key: "posts",
    })

    export const usePosts = (opts?: RESTQueryOpts<typeof RESTQuery>) => {
    	return useRESTQuery(POSTS_QUERY, opts)
    }
    ```

-   Typesafe imperative cache updates

    ```typescript
    import { RESTMutation, RESTMutationOpts, useRESTMutation, useRESTQueryClient } from "react-safeway"

    type Response = Pick<Post, "id">
    type PostPayload = Omit<Post, "id">

    const CREATE_POST_MUTATION = RESTMutation<Response, void, PostPayload>({
    	method: "POST",
    	url: "/posts",
    })

    export const useCreatePost = (opts?: RESTMutationOpts<typeof CREATE_POST_MUTATION>) => {
    	const queryClient = useRESTQueryClient()

    	return useRESTMutation(CREATE_POST_MUTATION, {
    		...opts,
    		onSuccess: (data, vars, context) => {
    			// typesafe cache update
    			queryClient.setTypedQueryData(
    				POSTS_QUERY, // reference which query should be updated
    				undefined,
    				(posts) => (posts || []).concat({ userId: 1, id: data.id, ...vars }),
    			)

    			opts?.onSuccess && opts.onSuccess(data, vars, context)
    		},
    	})
    }
    ```

## API

### `HTTPClient`

Abstraction layer to which both `RESTClient` and `GraphQLClient` can delegate their HTTP requests.
We could provide some default implementations, e.g. a `AxiosHTTPClient` and `FetchHTTPClient`, both it also possible to implement and provide its own `FooHTTPClient.`

### `RESTClient`

Handles all REST queries and mutations and delegates them to the underlying `HTTPClient`. Further, REST specific error handling is done here.

### `GraphQLClient`

Handles all GraphQL queries and mutations, transforms them into http requests, and delegates them to the underlying `HTTPClient`. Further, GraphQL specific error handling is done here.

### `RESTClientProvider` and `GraphQLClientProvider`

Provides the `RESTClient` / `GraphQLClient` via the React Context API and makes them accesible for the query and mutation hooks like `useRESTQuery`.
This is required, there are no default clients!

```typescript
// App.tsx

const App = () => {
	const restClient = useMemo(() => RESTClient(
		AxiosHTTPClient(
			axios.create({
				baseURL: "<url>",
			}),
		),
	), [])

    return (
        <RESTClientProvider client={restClient}>
            <MyApp />
        <RESTClientProvider/>
    )
}
```

### Query and Mutation hooks

For both REST and GraphQL APIs we provide a query and mutation hook, respectivly.

-   `useRESTQuery(query, opts)` which uses `react-query`'s `useQuery` under the hood
-   `useRESTMutation(mutation, opts)` which uses `react-query`'s `useMutation` under the hood

-   `useGraphQLQuery(query, opts)` which uses `react-query`'s `useQuery` under the hood
-   `useGraphQLMutation(mutation, opts)` which uses `react-query`'s `useMutation` under the hood

### `RESTQuery` and `RESTMutation`

`RESTQuery<TData, TVar>(opts)` enables us to define a typesafe REST `GET` query. Via the arguments we can define a (dynamic) url and a (dynamic) cache key, which is delegated to `react-query`. If we don't provide a `key`, `react-safeway` derives the cache key from the separate url parts, e.g. `/posts/5/comments` becomes `["posts", 5, "comments"]`.

```typescript
// without variables
const POSTS_QUERY = RESTQuery<Post[]>({
	url: "/posts",
	key: "posts",
})

// with variables and dynamic url and key
interface OrganizationUsersVariables {
	organizationID: number
}

ORGANIZATION_USERS_QUERY = RESTQuery<Organization[], OrganizationUsersVariables>({
	key: ({organizationID}) => ["organizations", organizationID, "users"], // could be omitted in this particular case
	url: ({organizationID}) => `/organizations/${organizationID}/users`,,
})
```

`RESTMutation<TData, TVar, TPayload>(opts)` enables us to define a typesafe mutating operation, using different HTTP methods like `POST`, `PATCH`, `PUT`, and `DELETE`.
As for queries, we can pass variables to a mutation, and in addition derive a payload from those variables, which is sent to the REST API. Per default, the variables are used as payload value.

```typescript
interface UpdateOrganizationNameVariables {
	organizationID: number
	name: string
}
type UpdateOrganizationNamePayload = Omit<UpdateOrganizationNameVariables, "organizationID">

const UPDATE_ORGANIZATION_NAME = RESTMutation<
	Organization,
	UpdateOrganizationNameVariables,
	UpdateOrganizationNamePayload
>({
	method: "PATCH",
	url: ({ organizationID }) => `/organizations/${organizationID}/name`,
	payload: ({ name }) => ({ name }),
})
```

### `GraphQLQuery` and `GraphQLMutation`

### Typesafe `QueryClient`

### Package Distribution

Since the GraphQL and REST client parts required different underlying (peer) dependencies, the idea would be to split `react-safeway` into 3 packages.

#### `@react-safeway/core`

Provides the shared core logic which both parts depend on, like `HTTPClient`.

#### `@react-safeway/rest`

Contains all REST related logic and APIs, like `RESTClient`, `useRESTQuery`, `useRESTMutation`, etc...

Depends on `@react-safeway/core`.

#### `@react-safeway/graphql`

Contains all GraphQL related logic and APIs, like `GraphQLClient`, `useGraphQLQuery`, `useGraphQLMutation`, etc...

Depends on `@react-safeway/core` and requires `graphql` as peer dependency.
