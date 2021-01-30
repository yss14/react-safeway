import { useQuery, UseQueryOptions } from "react-query"
import { useRESTClient } from "./RESTClientContext"
import { TypedRESTQuery } from "./types"

export type RESTQueryOpts<T> = T extends TypedRESTQuery<infer TData, infer TVar>
	? UseRESTQueryOptions<TData, TVar>
	: never

interface RESTVariables<TVar> {
	variables?: TVar
}

interface UseRESTQueryOptions<TData, TVar = {}> extends UseQueryOptions<TData>, RESTVariables<TVar> {
	resolver?: (args: any) => TData | Promise<TData> // TODO typing
}

export const useRESTQuery = <TData, TVar>(
	{ method, key, url }: TypedRESTQuery<TData, TVar>,
	{ resolver, variables = {} as TVar, ...opts }: UseRESTQueryOptions<TData, TVar> = {},
) => {
	const restClient = useRESTClient()

	// TODO useMemo
	const cachingKey = typeof key === "function" ? key(variables) : key
	const finalUrl = typeof url === "function" ? url(variables) : url

	const queryObject = useQuery<TData, unknown, TData>(
		cachingKey,
		async () => {
			if (resolver) {
				return resolver({})
			} else {
				return restClient.request<TData, void>({
					method,
					url: finalUrl,
				})
			}
		},
		opts,
	)

	return queryObject
}
