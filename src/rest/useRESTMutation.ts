import { useMutation, UseMutationOptions, UseMutationResult } from "react-query"
import { HTTPMethod } from "../core/HTTPClient"
import { useRESTClient } from "./RESTClientContext"

interface UseRESTMutationOptionsBase {
	method: HTTPMethod
}

export interface UseRESTMutationOptionsWithoutVariables<TData>
	extends UseRESTMutationOptionsBase,
		UseMutationOptions<TData, unknown, undefined> {
	url: string | (() => string)
	resolver?: () => TData | Promise<TData>
}

export interface UseRESTMutationOptionsWithVariables<TData, TVar, TPayload>
	extends UseRESTMutationOptionsBase,
		UseMutationOptions<TData, unknown, TVar> {
	url: string | ((variables: TVar) => string)
	payload: (variables: TVar) => TPayload
	resolver?: (variables: TVar) => TData | Promise<TData>
}

export type UseRESTMutationOptions<TData, TVar, TPayload> =
	| UseRESTMutationOptionsWithoutVariables<TData>
	| UseRESTMutationOptionsWithVariables<TData, TVar, TPayload>

const isOptsWithVariables = <TData, TVar, TPayload>(
	obj: any,
): obj is UseRESTMutationOptionsWithVariables<TData, TVar, TPayload> =>
	typeof (obj as UseRESTMutationOptionsWithVariables<TData, TVar, TPayload>).payload !== "undefined"

export function useRESTMutation<TData>(
	opts: UseRESTMutationOptionsWithoutVariables<TData>,
): UseMutationResult<TData, unknown, undefined>
export function useRESTMutation<TData, TVar, TPayload>(
	opts: UseRESTMutationOptionsWithVariables<TData, TVar, TPayload>,
): UseMutationResult<TData, unknown, TVar>
export function useRESTMutation<TData, TVar, TPayload>(
	opts: UseRESTMutationOptions<TData, TVar | undefined, TPayload | undefined>,
) {
	const restClient = useRESTClient()

	const queryObject = useMutation<TData, unknown, TVar>(async (variables) => {
		const finalUrl = typeof opts.url === "function" ? opts.url(variables) : opts.url
		const finalPayload = isOptsWithVariables<TData, TVar, TPayload>(opts) ? opts.payload(variables) : undefined

		if (opts.resolver) {
			return opts.resolver(variables)
		} else {
			return restClient.request<TData, TPayload | TVar>({
				method: opts.method, // TODO migh move to mutation definition?
				url: finalUrl,
				payload: finalPayload,
			})
		}
	}, opts as any) // TODO add opts

	return queryObject
}
