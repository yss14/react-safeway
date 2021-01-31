import React from "react"
import { RESTClient } from "./RESTClient"
import { RESTClientContext } from "./RESTClientContext"

interface RESTClientProviderProps {
	client: RESTClient
}

export const RESTClientProvider: React.FC<RESTClientProviderProps> = ({ client, children }) => (
	<RESTClientContext.Provider value={client}>{children}</RESTClientContext.Provider>
)
