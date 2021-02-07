import { useMemo } from "react"
import { QueryObserverResult, useQuery, UseQueryOptions } from "react-query"
import { TypedQuery, TypedQueryWithoutVariables, TypedQueryWithVariables } from "../core/TypedQuery"
import { useRESTClient } from "./RESTClientContext"

export type RESTQueryOpts<T> = T extends TypedQuery<infer TData, infer TVar>
	? TVar extends undefined
		? UseRESTQueryOptionsWithoutVariables<TData>
		: UseRESTQueryOptionsWithVariables<TData, TVar>
	: never

export interface UseRESTQueryOptionsWithoutVariables<TData> extends UseQueryOptions<TData, unknown, TData> {
	url: string | (() => string)
	resolver?: () => TData | Promise<TData>
}

export interface UseRESTQueryOptionsWithVariables<TData, TVar> extends UseQueryOptions<TData, unknown, TData> {
	variables: TVar
	url: string | ((variables: TVar) => string)
	resolver?: (variables: TVar) => TData | Promise<TData>
}

export type UseRESTQueryOptions<TData, TVar> =
	| UseRESTQueryOptionsWithVariables<TData, TVar>
	| UseRESTQueryOptionsWithoutVariables<TData>

const isOptsWithVariables = <TData, TVar>(obj: any): obj is UseRESTQueryOptionsWithVariables<TData, TVar> =>
	typeof (obj as UseRESTQueryOptionsWithVariables<TData, TVar>).variables !== "undefined"

export function useRESTQuery<TData, TVar>(
	query: TypedQueryWithVariables<TData, TVar>,
	opts: UseRESTQueryOptionsWithVariables<TData, TVar>,
): QueryObserverResult<TData>
export function useRESTQuery<TData>(
	query: TypedQueryWithoutVariables<TData>,
	opts: UseRESTQueryOptionsWithoutVariables<TData>,
): QueryObserverResult<TData>
export function useRESTQuery<TData, TVar>(
	query: TypedQuery<TData, TVar | undefined>,
	opts: UseRESTQueryOptions<TData, TVar | undefined>,
): QueryObserverResult<TData> {
	const restClient = useRESTClient()

	const queryKey = useMemo(() => {
		if (typeof query.key === "function") {
			if (isOptsWithVariables<TData, TVar>(opts)) {
				return query.key(opts.variables)
			} else {
				return query.key(undefined)
			}
		} else {
			return query.key
		}
	}, [query.key, opts])

	const finalUrl = useMemo(() => {
		if (typeof opts.url === "function") {
			if (isOptsWithVariables<TData, TVar>(opts)) {
				return opts.url(opts.variables)
			} else {
				return opts.url(undefined)
			}
		}

		return opts.url
	}, [query, opts])

	const queryObject = useQuery<TData, unknown, TData>(
		queryKey,
		async () => {
			if (opts && opts.resolver) {
				if (isOptsWithVariables<TData, TVar>(opts)) {
					return opts.resolver(opts.variables)
				} else {
					return opts.resolver(undefined)
				}
			} else {
				return restClient.request<TData, void>({
					method: "GET",
					url: finalUrl,
				})
			}
		},
		opts,
	)

	return queryObject
}
