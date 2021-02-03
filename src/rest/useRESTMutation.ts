import { useMutation, UseMutationOptions } from "react-query"
import { useRESTClient } from "./RESTClientContext"
import { TypedRESTMutation } from "./types"

export type RESTMutationOpts<T> = T extends TypedRESTMutation<infer TData, infer TVar, infer TPayload>
	? UseRESTMutationOptions<TData, TVar, TPayload>
	: never

interface RESTVariables<TVar> {
	variables?: TVar
}

interface UseRESTMutationOptions<TData, TVar, TPayload>
	extends UseMutationOptions<TData, unknown, TVar>,
		RESTVariables<TVar> {
	resolver?: (args: any) => TData | Promise<TData> // TODO typing
}

export const useRESTMutation = <TData, TVar, TPayload>(
	{ method, url, payload }: TypedRESTMutation<TData, TVar, TPayload>,
	{ resolver, variables, ...opts }: UseRESTMutationOptions<TData, TVar, TPayload> = {},
) => {
	const restClient = useRESTClient()

	const queryObject = useMutation<TData, unknown, TVar>(async (variables) => {
		const finalUrl = typeof url === "function" ? url(variables || ({} as TVar)) : url
		const finalPayload = typeof payload === "function" ? payload(variables || ({} as TVar)) : payload

		if (resolver) {
			return resolver({})
		} else {
			return restClient.request<TData, TPayload>({
				method,
				url: finalUrl,
				payload: finalPayload,
			})
		}
	}, opts)

	return queryObject
}
