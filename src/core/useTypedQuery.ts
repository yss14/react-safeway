import { useMemo } from "react"
import { QueryObserverResult, QueryOptions, useQuery } from "react-query"
import { TypedQuery } from "./TypedQuery"

export type UseTypedQueryQueryFn<TData> = () => Promise<TData>

export interface UseTypedQueryOptionsWithoutVariables<TData> extends QueryOptions<TData, unknown, TData> {}

export interface UseTypedQueryOptionsWithVariables<TData, TVar> extends QueryOptions<TData, unknown, TData> {
	variables: TVar
}

export type UseTypedQueryOpts<TData, TVar> =
	| UseTypedQueryOptionsWithVariables<TData, TVar>
	| UseTypedQueryOptionsWithoutVariables<TData>

export type TypedQueryOpts<T> = T extends TypedQuery<infer TData, infer TVar>
	? TVar extends undefined
		? UseTypedQueryOptionsWithoutVariables<TData>
		: UseTypedQueryOptionsWithVariables<TData, TVar>
	: never

const isArgsWithVariables = <TData, TVar>(
	obj: UseTypedQueryOptionsWithoutVariables<TData>,
): obj is UseTypedQueryOptionsWithVariables<TData, TVar> =>
	typeof (obj as UseTypedQueryOptionsWithVariables<TData, TVar>).variables !== "undefined"

export function useTypedQuery<TData>(
	query: TypedQuery<TData, undefined>,
	queryFn: UseTypedQueryQueryFn<TData>,
	opts?: UseTypedQueryOptionsWithoutVariables<TData>,
): QueryObserverResult<TData>
export function useTypedQuery<TData, TVar>(
	query: TypedQuery<TData, TVar>,
	queryFn: UseTypedQueryQueryFn<TData>,
	opts: UseTypedQueryOptionsWithVariables<TData, TVar>,
): QueryObserverResult<TData>
export function useTypedQuery<TData, TVar>(
	query: TypedQuery<TData, TVar | undefined>,
	queryFn: UseTypedQueryQueryFn<TData>,
	opts?: UseTypedQueryOpts<TData, TVar>,
): QueryObserverResult<TData> {
	const queryKey = useMemo(() => {
		if (typeof query.key === "function") {
			if (opts && isArgsWithVariables(opts)) {
				return query.key(opts.variables)
			} else {
				return query.key(undefined)
			}
		}

		return query.key
	}, [query.key, opts])

	return useQuery(queryKey, queryFn, opts)
}
