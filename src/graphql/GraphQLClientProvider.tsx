import React from "react"
import { GraphQLClient } from "./GraphQLClient"
import { GraphQLClientContext } from "./GraphQLClientContext"

interface GraphQLClientProviderProps {
	client: GraphQLClient
}

export const GraphQLClientProvider: React.FC<GraphQLClientProviderProps> = ({ client, children }) => (
	<GraphQLClientContext.Provider value={client}>{children}</GraphQLClientContext.Provider>
)
