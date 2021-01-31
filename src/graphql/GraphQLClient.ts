import { GraphQLError, print } from "graphql"
import { HTTPClient } from "../core/HTTPClient"
import { TypedGraphQLOperation } from "./types"

export interface GraphQLResponse<TData> {
	data?: TData
	errors?: GraphQLError[]
	extensions?: any
	status: number
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

			if (response.statusCode >= 200 && response.statusCode <= 204 && response.data.data) {
				return response.data.data
			} else {
				// TODO error handling
				throw new Error("Wrong status code returned")
			}
		} catch (err) {
			// TODO error handling
			throw err
		}
	}

	return {
		request,
	}
}
