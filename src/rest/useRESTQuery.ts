import { useMemo } from "react"
import { QueryObserverResult, useQuery, UseQueryOptions } from "react-query"
import { useRESTClient } from "./RESTClientContext"
import { TypedRESTQuery } from "./types"

export type RESTQueryOpts<T> = T extends TypedRESTQuery<infer TData, infer TVar>
	? TVar extends undefined
		? UseRESTQueryOptionsWithoutVariables<TData>
		: UseRESTQueryOptionsWithVariables<TData, TVar>
	: never

export interface UseRESTQueryOptionsWithoutVariables<TData> extends UseQueryOptions<TData, unknown, TData> {
	url?: string | (() => string)
	resolver?: () => TData | Promise<TData>
}

export interface UseRESTQueryOptionsWithVariables<TData, TVar> extends UseQueryOptions<TData, unknown, TData> {
	variables: TVar
	url?: string | ((variables: TVar) => string)
	resolver?: (args: TVar) => TData | Promise<TData>
}

export type UseRESTQueryOptions<TData, TVar> =
	| UseRESTQueryOptionsWithVariables<TData, TVar>
	| UseRESTQueryOptionsWithoutVariables<TData>

const isArgsWithVariables = <TData, TVar>(obj: any): obj is UseRESTQueryOptionsWithVariables<TData, TVar> =>
	typeof (obj as UseRESTQueryOptionsWithVariables<TData, TVar>).variables !== "undefined"

export function useRESTQuery<TData>(
	query: TypedRESTQuery<TData, undefined>,
	opts?: UseRESTQueryOptionsWithoutVariables<TData>,
): QueryObserverResult<TData>
export function useRESTQuery<TData, TVar>(
	query: TypedRESTQuery<TData, TVar>,
	opts: UseRESTQueryOptionsWithVariables<TData, TVar>,
): QueryObserverResult<TData>
export function useRESTQuery<TData, TVar>(
	query: TypedRESTQuery<TData, TVar | undefined>,
	opts?: UseRESTQueryOptions<TData, TVar | undefined>,
): QueryObserverResult<TData> {
	const restClient = useRESTClient()

	const queryKey = useMemo(() => {
		if (typeof query.key === "function") {
			if (opts && isArgsWithVariables<TData, TVar>(opts)) {
				return query.key(opts.variables)
			} else {
				return query.key(undefined)
			}
		} else {
			return query.key
		}
	}, [query.key, opts])

	const finalUrl = useMemo(() => {
		const url = query?.url || opts?.url

		if (!url) {
			throw new Error(
				"useRESTQuery requires an url. Please provide one either via the query object, or via the hook options!",
			) // TODO resolve via types that at leats one url option is set
		}

		if (typeof url === "function") {
			if (opts && isArgsWithVariables<TData, TVar>(opts)) {
				return url(opts.variables)
			} else {
				return url(undefined)
			}
		}

		return url
	}, [query, opts])

	const queryObject = useQuery<TData, unknown, TData>(
		queryKey,
		async () => {
			if (opts && opts.resolver) {
				if (isArgsWithVariables<TData, TVar>(opts)) {
					return opts.resolver(opts.variables)
				} else {
					return opts.resolver(undefined)
				}
			} else {
				return restClient.request<TData, void>({
					method: query.method,
					url: finalUrl,
				})
			}
		},
		opts,
	)

	return queryObject
}
