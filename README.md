# react-safeway

An opionated typesafe `react-query` extension for both REST and GraphQL queries and mutations.

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
