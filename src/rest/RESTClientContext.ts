import React, { useContext } from "react"
import { RESTClient } from "./RESTClient"

export const RESTClientContext = React.createContext<RESTClient | null>(null)

export const useRESTClient = () => {
	const client = useContext(RESTClientContext)

	if (!client) {
		throw new Error("useRESTClient hook can only be used within the scope of a RESTClientContext")
	}

	return client
}
