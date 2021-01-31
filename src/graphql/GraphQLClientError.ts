import { GraphQLResponse } from "./GraphQLClient"

export interface GraphQLRequestContext<TVar> {
	query: string
	variables?: TVar
}

export class GraphQLClientError<TData, TVar> extends Error {
	response: GraphQLResponse<TData>
	request: GraphQLRequestContext<TVar>

	constructor(response: GraphQLResponse<TData>, request: GraphQLRequestContext<TVar>) {
		const message = GraphQLClientError.extractMessage(response)
		super(message)

		this.response = response
		this.request = request

		// this is needed as Safari doesn't support .captureStackTrace
		if (typeof (Error as any).captureStackTrace === "function") {
			;(Error as any).captureStackTrace(this, GraphQLClientError)
		}
	}

	private static extractMessage<TData>(response: GraphQLResponse<TData>): string {
		try {
			return response.errors![0].message
		} catch (e) {
			return `GraphQL Error (Code: ${response.status})`
		}
	}
}
