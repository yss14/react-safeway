import React, { useContext } from "react"
import { GraphQLClient } from "./GraphQLClient"

export const GraphQLClientContext = React.createContext<GraphQLClient | null>(null)

export const useGraphQLClient = () => {
	const client = useContext(GraphQLClientContext)

	if (!client) {
		throw new Error("useGraphQLClient hook can only be used within the scope of a GraphQLClientContext")
	}

	return client
}
