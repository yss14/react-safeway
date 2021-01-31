# react-safeway

An opionated typesafe `react-query` extension for both REST and GraphQL queries and mutations.

**Currently this library is only a proposal and is under heavy development**

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

The same principle as for the REST equivalent applies to the GraphQL part, excep the difference of passing a GraphQL document instead of an url, since for most GraphQL endpoints all queries and mutations are realized as a `POST` request to a fixed url.

```typescript
interface SongQueryData {
	share: {
		song: Required<ShareSong>
	}
}

interface SongQueryVariables {
	shareID: string
	songID: string
}

const SONG_QUERY = GraphQLQuery<SongQueryData, SongQueryVariables>(gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				id
                title
                artists
                ...
			}
    	}
  	}
`)

// Same principle applies to GraphQLMutation!
```

### Typesafe `QueryClient`

Since `react-query@3` we have to manually created our own `QueryClient` instance and provide access via the `QueryClientProvider`.

The same would apply to `react-safeway`! We provide an extended version of the `QueryClient`, named `RESTQueryClient` / `GraphQLQueryClient`, both providing typesafe access to methods like `getQueryData`, `setQueryData`, etc...

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

    const restQueryClient = useMemo(() => new RESTQueryClient())

    return (
        <RESTClientProvider client={restClient}>
            <RESTQueryClientProvider vlient={restQueryClient}>
                <MyApp />
            </RESTQueryClientProvider>
        <RESTClientProvider/>
    )
}

// useUpdateOrganizationName.ts

export const useUpdateOrganizationName = (opts?: RESTMutationOpts<typeof UPDATE_ORGANIZATION_NAME>) => {
	const queryClient = useRESTQueryClient() // gives access to the typesafe REST query client extension

	return useRESTMutation(UPDATE_ORGANIZATION_NAME, {
		...opts,
		onSuccess: (data, vars, context) => {
			queryClient.setTypedQueryData(
				ORGANIZATION_QUERY,
                {organizationID: vars.organizationID},
                // we are forced to provide the correct data here, since setTypedQueryData inferes the required data type of the query
				(organization) => ({...organization, name: data.name}),
			)

			opts?.onSuccess && opts.onSuccess(data, vars, context)
		},
	})
}
```

### Transformed Queries and Mutations

// TODO

### Error Handling

// TODO

## Package Distribution

Since the GraphQL and REST client parts required different underlying (peer) dependencies, the idea would be to split `react-safeway` into 3 packages.

Furthermore, we would commit to always keep `react-safeway` update-to-date with the latest `react-query` version.

### `@react-safeway/core`

Provides the shared core logic which both parts depend on, like `HTTPClient`.

### `@react-safeway/rest`

Contains all REST related logic and APIs, like `RESTClient`, `useRESTQuery`, `useRESTMutation`, etc...

Depends on `@react-safeway/core`.

### `@react-safeway/graphql`

Contains all GraphQL related logic and APIs, like `GraphQLClient`, `useGraphQLQuery`, `useGraphQLMutation`, etc...

Depends on `@react-safeway/core` and requires `graphql` as peer dependency.
