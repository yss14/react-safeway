import React, { useContext } from "react"
import { QueryClientProvider } from "react-query"
import { RESTQueryClient } from "./typedQueryClient"

export const RESTQueryClientContext = React.createContext<RESTQueryClient | null>(null)

export const useRESTQueryClient = () => {
	const queryClient = useContext(RESTQueryClientContext)

	if (!queryClient) {
		throw new Error("useSafewayQueryClient hook can only be used within the scope of a SafewayQueryClientContext")
	}

	return queryClient
}

export interface RESTQueryClientProviderProps {
	client?: RESTQueryClient
}

const defaultQueryClient = new RESTQueryClient()

export const RESTQueryClientProvider: React.FC<RESTQueryClientProviderProps> = ({ client, children }) => (
	<RESTQueryClientContext.Provider value={client || defaultQueryClient}>
		<QueryClientProvider client={client || defaultQueryClient}>{children}</QueryClientProvider>
	</RESTQueryClientContext.Provider>
)
