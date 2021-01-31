import { GraphQLError, print } from "graphql"
import { HTTPClient } from "../core/HTTPClient"
import { HTTPError } from "../core/HTTPError"
import { GraphQLClientError } from "./GraphQLClientError"
import { TypedGraphQLOperation } from "./types"

export interface GraphQLResponse<TData> {
	data?: TData
	errors?: GraphQLError[]
	extensions?: any
	status?: number
	[key: string]: any
}

export type GraphQLClient = ReturnType<typeof GraphQLClient>

export const GraphQLClient = (httpClient: HTTPClient) => {
	const request = async <TData, TVar>({ query, variables }: TypedGraphQLOperation<TData, TVar>) => {
		const printedQuery = typeof query === "string" ? query : print(query)
		const body = JSON.stringify({
			query: printedQuery,
			variables: variables ? variables : undefined,
		})

		try {
			const response = await httpClient.request<typeof body, GraphQLResponse<TData>>({
				method: "POST",
				data: body,
			})

			if (response.status >= 200 && response.status <= 204 && response.data.data) {
				return response.data.data
			} else {
				throw new GraphQLClientError<TData, TVar>(
					{
						...response.data,
					},
					{
						query: printedQuery,
						variables: variables ? variables : undefined,
					},
				)
			}
		} catch (err) {
			if (err instanceof HTTPError) {
				throw new GraphQLClientError<TData, TVar>(
					{
						...err,
					},
					{
						query: printedQuery,
						variables: variables ? variables : undefined,
					},
				)
			}

			throw err
		}
	}

	return {
		request,
	}
}
