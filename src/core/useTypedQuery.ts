import { useMemo } from "react"
import { QueryObserverResult, QueryOptions, useQuery } from "react-query"
import { TypedQuery } from "./TypedQuery"

export type UseTypedQueryQueryFn<TData> = () => Promise<TData>

interface UseTypedQueryOptsWithoutVariables<TData> extends QueryOptions<TData, unknown, TData> {}

interface UseTypedQueryOptsWithVariables<TData, TVar> extends QueryOptions<TData, unknown, TData> {
	variables: TVar
}

export type UseTypedQueryOpts<TData, TVar> =
	| UseTypedQueryOptsWithVariables<TData, TVar>
	| UseTypedQueryOptsWithoutVariables<TData>

const isArgsWithVariables = <TData, TVar>(
	obj: UseTypedQueryOptsWithoutVariables<TData>,
): obj is UseTypedQueryOptsWithVariables<TData, TVar> =>
	typeof (obj as UseTypedQueryOptsWithVariables<TData, TVar>).variables !== "undefined"

export function useTypedQuery<TData>(
	query: TypedQuery<TData, undefined>,
	queryFn: UseTypedQueryQueryFn<TData>,
	opts?: UseTypedQueryOptsWithoutVariables<TData>,
): QueryObserverResult<TData>
export function useTypedQuery<TData, TVar>(
	query: TypedQuery<TData, TVar>,
	queryFn: UseTypedQueryQueryFn<TData>,
	opts: UseTypedQueryOptsWithVariables<TData, TVar>,
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
		} else {
			return query.key
		}
	}, [query.key])

	return useQuery(queryKey, queryFn, opts)
}
